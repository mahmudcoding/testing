// Reproducer — a Mac app around the local bench server.
//
// The chrome is real AppKit, not CSS pretending: an NSSplitViewController with a
// vibrant source-list sidebar under a unified NSToolbar. Only the detail pane is
// a web view. That distinction is the whole reason it reads as a Mac app —
// vibrancy, the source-list selection, the toolbar and the tracking separator
// cannot be imitated in a page.
//
// Starts scripts/bench.py on a free port and stops it when the app quits.

import AppKit
import WebKit

let REPO = Bundle.main.object(forInfoDictionaryKey: "BenchRepoPath") as? String
    ?? ("\(NSHomeDirectory())/Projects/testing")

func freePort() -> Int {
    let s = socket(AF_INET, SOCK_STREAM, 0)
    defer { close(s) }
    var a = sockaddr_in()
    a.sin_family = sa_family_t(AF_INET)
    a.sin_addr.s_addr = inet_addr("127.0.0.1")
    a.sin_port = 0
    _ = withUnsafePointer(to: &a) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { bind(s, $0, socklen_t(MemoryLayout<sockaddr_in>.size)) }
    }
    var len = socklen_t(MemoryLayout<sockaddr_in>.size)
    _ = withUnsafeMutablePointer(to: &a) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { getsockname(s, $0, &len) }
    }
    return Int(UInt16(bigEndian: a.sin_port))
}

struct Row {
    var id: String
    var title: String
    var verdict: String     // "", "y", "n", "s"
}

// ── source-list cell ─────────────────────────────────────────────────────────
final class RowCell: NSTableCellView {
    let dot = NSView()
    let label = NSTextField(labelWithString: "")

    override init(frame: NSRect) {
        super.init(frame: frame)
        dot.wantsLayer = true
        dot.layer?.cornerRadius = 4
        dot.translatesAutoresizingMaskIntoConstraints = false
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = .systemFont(ofSize: NSFont.systemFontSize)
        label.maximumNumberOfLines = 2
        label.lineBreakMode = .byTruncatingTail
        label.cell?.wraps = true
        label.cell?.isScrollable = false
        label.cell?.usesSingleLineMode = false
        label.cell?.truncatesLastVisibleLine = true
        addSubview(dot); addSubview(label)
        NSLayoutConstraint.activate([
            dot.leadingAnchor.constraint(equalTo: leadingAnchor),
            dot.topAnchor.constraint(equalTo: topAnchor, constant: 7),
            dot.widthAnchor.constraint(equalToConstant: 8),
            dot.heightAnchor.constraint(equalToConstant: 8),
            label.leadingAnchor.constraint(equalTo: dot.trailingAnchor, constant: 8),
            label.trailingAnchor.constraint(equalTo: trailingAnchor),
            label.centerYAnchor.constraint(equalTo: centerYAnchor),
        ])
        textField = label
    }
    required init?(coder: NSCoder) { fatalError() }

    // usesAutomaticRowHeights measures the cell, and the label only reports a
    // two-line height once it knows the width it must wrap into.
    override func layout() {
        super.layout()
        label.preferredMaxLayoutWidth = label.bounds.width
    }

    func fill(_ r: Row) {
        label.stringValue = r.title
        switch r.verdict {
        case "y": dot.layer?.backgroundColor = NSColor.systemGreen.cgColor
        case "n": dot.layer?.backgroundColor = NSColor.systemRed.cgColor
        case "s": dot.layer?.backgroundColor = NSColor.tertiaryLabelColor.cgColor
        default:  dot.layer?.backgroundColor = NSColor.quaternaryLabelColor.cgColor
        }
    }
}

// ── sidebar ──────────────────────────────────────────────────────────────────
final class SidebarVC: NSViewController, NSTableViewDataSource, NSTableViewDelegate {
    var rows: [Row] = []
    var onSelect: ((Int) -> Void)?
    let table = NSTableView()
    private var suppress = false

    override func loadView() {
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.drawsBackground = false
        scroll.automaticallyAdjustsContentInsets = true

        let col = NSTableColumn(identifier: .init("t"))
        col.resizingMask = .autoresizingMask
        table.addTableColumn(col)
        table.headerView = nil
        table.dataSource = self
        table.delegate = self
        table.rowSizeStyle = .custom
        table.rowHeight = 38
        table.backgroundColor = .clear
        table.selectionHighlightStyle = .regular
        if #available(macOS 11.0, *) { table.style = .sourceList }
        scroll.documentView = table
        view = scroll
    }

    func set(_ rs: [Row], cur: Int) {
        rows = rs
        table.reloadData()
        guard cur >= 0, cur < rs.count else { return }
        suppress = true
        table.selectRowIndexes(IndexSet(integer: cur), byExtendingSelection: false)
        table.scrollRowToVisible(cur)
        suppress = false
    }

    func numberOfRows(in tableView: NSTableView) -> Int { rows.count }

    func tableView(_ t: NSTableView, viewFor col: NSTableColumn?, row: Int) -> NSView? {
        let id = NSUserInterfaceItemIdentifier("cell")
        let cell = (t.makeView(withIdentifier: id, owner: self) as? RowCell) ?? {
            let c = RowCell(frame: .zero); c.identifier = id; return c
        }()
        cell.fill(rows[row])
        return cell
    }

    func tableViewSelectionDidChange(_ n: Notification) {
        guard !suppress, table.selectedRow >= 0 else { return }
        onSelect?(table.selectedRow)
    }
}

/// Detail pane: the web view, with a native launch panel over it until the
/// server is up. A page pretending to be a launch screen would flash white and
/// show the wrong font before the real one loads.
final class DetailVC: NSViewController {
    let web: WKWebView
    private let overlay = NSView()
    private let phase = NSTextField(labelWithString: "")
    private let bar = NSProgressIndicator()
    private let detail = NSTextField(wrappingLabelWithString: "")
    private let detailScroll = NSScrollView()
    private var easer: Timer?

    init(web: WKWebView) { self.web = web; super.init(nibName: nil, bundle: nil) }
    required init?(coder: NSCoder) { fatalError() }

    override func loadView() {
        let root = NSView()
        web.translatesAutoresizingMaskIntoConstraints = false
        overlay.translatesAutoresizingMaskIntoConstraints = false
        overlay.wantsLayer = true
        root.addSubview(web); root.addSubview(overlay)
        NSLayoutConstraint.activate([
            web.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            web.topAnchor.constraint(equalTo: root.topAnchor),
            web.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            overlay.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            overlay.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            overlay.topAnchor.constraint(equalTo: root.topAnchor),
            overlay.bottomAnchor.constraint(equalTo: root.bottomAnchor),
        ])

        phase.font = .systemFont(ofSize: 12)
        phase.textColor = .secondaryLabelColor
        phase.alignment = .center
        bar.isIndeterminate = false
        bar.minValue = 0; bar.maxValue = 1; bar.doubleValue = 0
        bar.controlSize = .small

        detail.font = .monospacedSystemFont(ofSize: 10, weight: .regular)
        detail.textColor = .secondaryLabelColor
        detailScroll.documentView = detail
        detailScroll.hasVerticalScroller = true
        detailScroll.drawsBackground = false
        detailScroll.isHidden = true

        let stack = NSStackView(views: [phase, bar, detailScroll])
        stack.orientation = .vertical
        stack.alignment = .centerX
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: overlay.centerYAnchor),
            stack.widthAnchor.constraint(lessThanOrEqualTo: overlay.widthAnchor, constant: -80),
            bar.widthAnchor.constraint(equalToConstant: 220),
            detailScroll.widthAnchor.constraint(equalToConstant: 420),
            detailScroll.heightAnchor.constraint(lessThanOrEqualToConstant: 150),
        ])
        view = root
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        overlay.layer?.backgroundColor = NSColor.textBackgroundColor.cgColor
    }

    /// Advance the bar on a clock, not on retries. The readiness poll blocks in
    /// a single long request while the reports are parsed, so there is nothing
    /// to count -- driving the bar off attempts left it frozen a quarter in.
    func begin(_ text: String) {
        overlay.isHidden = false
        phase.stringValue = text
        phase.textColor = .secondaryLabelColor
        bar.isHidden = false
        bar.doubleValue = 0.04
        detailScroll.isHidden = true
        easer?.invalidate()
        var ticks = 0
        let t = Timer(timeInterval: 0.08, repeats: true) { [weak self] _ in
            guard let self else { return }
            ticks += 1
            // asymptotic: always moving, never arrives before the app does
            self.bar.doubleValue += (0.93 - self.bar.doubleValue) * 0.02
            if ticks == 120 { self.phase.stringValue = "Still reading the reports…" }
            if ticks == 400 { self.phase.stringValue = "Taking longer than usual…" }
        }
        RunLoop.main.add(t, forMode: .common)
        easer = t
    }

    func failed(_ text: String, log: String) {
        easer?.invalidate(); easer = nil
        overlay.isHidden = false
        phase.stringValue = text
        phase.textColor = .systemRed
        bar.isHidden = true
        detail.stringValue = log
        detailScroll.isHidden = log.isEmpty
    }

    func done() {
        easer?.invalidate(); easer = nil
        // let the bar actually arrive before the panel goes: hiding it at 0.8
        // reads as the load being abandoned rather than finished
        phase.stringValue = "Ready"
        bar.animator().doubleValue = 1
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.32) { [weak self] in
            self?.overlay.isHidden = true
        }
    }
}

// ── app ──────────────────────────────────────────────────────────────────────
final class AppDelegate: NSObject, NSApplicationDelegate, NSToolbarDelegate,
                         WKNavigationDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var web: WKWebView!
    var split: NSSplitViewController!
    var detailVC: DetailVC!
    var sideItem: NSSplitViewItem!
    var sidebar = SidebarVC()
    var server: Process?
    var port = 0
    var log = ""

    var reproItem: NSToolbarItem!
    var verdictItem: NSToolbarItem!
    let reproButton = NSButton()
    let verdict = NSSegmentedControl(labels: ["Confirmed", "Not a bug", "Skip"],
                                     trackingMode: .selectOne, target: nil, action: nil)

    func applicationDidFinishLaunching(_ n: Notification) {
        port = freePort()
        buildWindow()
        startServer()
        waitForServer(attempt: 0)
    }

    // MARK: window

    func buildWindow() {
        let cfg = WKWebViewConfiguration()
        cfg.defaultWebpagePreferences.allowsContentJavaScript = true
        cfg.userContentController.add(self, name: "app")
        web = WKWebView(frame: .zero, configuration: cfg)
        web.navigationDelegate = self

        sideItem = NSSplitViewItem(sidebarWithViewController: sidebar)
        sideItem.minimumThickness = 150
        sideItem.maximumThickness = 320
        if #available(macOS 11.0, *) { sideItem.allowsFullHeightLayout = true }
        sideItem.canCollapse = true
        detailVC = DetailVC(web: web)
        let mainItem = NSSplitViewItem(viewController: detailVC)
        mainItem.minimumThickness = 330

        split = NSSplitViewController()
        split.addSplitViewItem(sideItem)
        split.addSplitViewItem(mainItem)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1020, height: 700),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.title = "Reproducer"          // Dock and Window menu only
        window.titleVisibility = .hidden     // not painted into the toolbar
        window.contentViewController = split
        // assigning contentViewController resizes the window to the view
        // controller's own size, so contentRect above does not survive it
        window.minSize = NSSize(width: 520, height: 460)

        let tb = NSToolbar(identifier: "main")
        tb.delegate = self
        tb.displayMode = .iconOnly
        tb.allowsUserCustomization = false
        window.toolbar = tb
        if #available(macOS 11.0, *) { window.toolbarStyle = .unified }

        window.setFrameAutosaveName("ReproducerMain")
        let restored = window.setFrameUsingName("ReproducerMain")
        window.makeKeyAndOrderFront(nil)
        if !restored {
            window.setContentSize(NSSize(width: 1020, height: 700))
            window.center()
        }
        // the split remembers its own width and whether it is collapsed, so
        // hiding the sidebar stays hidden across launches
        split.splitView.autosaveName = "ReproducerSplit"
        if !restored { split.splitView.setPosition(218, ofDividerAt: 0) }
        NSApp.activate(ignoringOtherApps: true)

        sidebar.onSelect = { [weak self] i in
            self?.web.evaluateJavaScript("window.__select && __select(\(i))")
        }
        detailVC.begin("Reading the reports…")
    }

    // MARK: toolbar

    static let idRepro = NSToolbarItem.Identifier("repro")
    static let idVerdict = NSToolbarItem.Identifier("verdict")

    func toolbarAllowedItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        toolbarDefaultItemIdentifiers(t)
    }

    func toolbarDefaultItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        var ids: [NSToolbarItem.Identifier] = [.toggleSidebar]
        if #available(macOS 11.0, *) { ids.append(.sidebarTrackingSeparator) }
        ids += [.flexibleSpace, AppDelegate.idVerdict]
        return ids
    }

    func toolbar(_ t: NSToolbar, itemForItemIdentifier id: NSToolbarItem.Identifier,
                 willBeInsertedIntoToolbar flag: Bool) -> NSToolbarItem? {
        switch id {
        case AppDelegate.idRepro:
            reproButton.bezelStyle = .texturedRounded
            reproButton.title = "Reproduce"
            if #available(macOS 11.0, *) {
                reproButton.image = NSImage(systemSymbolName: "play.fill", accessibilityDescription: nil)
                reproButton.imagePosition = .imageLeading
            }
            reproButton.target = self
            reproButton.action = #selector(hitRepro)
            reproButton.isEnabled = false
            let it = NSToolbarItem(itemIdentifier: id)
            it.view = reproButton
            it.label = "Reproduce"
            it.toolTip = "Drive the browser to this defect (R)"
            reproItem = it
            return it
        case AppDelegate.idVerdict:
            verdict.segmentStyle = .texturedRounded
            verdict.selectedSegment = -1
            verdict.target = self
            verdict.action = #selector(hitVerdict)
            verdict.isEnabled = false
            let it = NSToolbarItem(itemIdentifier: id)
            it.view = verdict
            it.label = "Verdict"
            verdictItem = it
            return it
        default:
            return nil
        }
    }

    @objc func hitRepro() { web.evaluateJavaScript("window.__repro && __repro()") }

    @objc func hitVerdict() {
        let v = ["y", "n", "s"]
        let i = verdict.selectedSegment
        guard i >= 0, i < v.count else { return }
        web.evaluateJavaScript("window.__verdict && __verdict('\(v[i])')")
    }

    @objc func reloadPage() { web.reload() }

    // MARK: bridge

    /// Park this window on the left of the screen. The rig browser takes the
    /// right in the same pass, so neither covers the other while a run is
    /// watched -- see scripts/callrig/snip/_tile.mjs.
    func tileLeft(_ w: CGFloat) {
        guard let scr = window.screen ?? NSScreen.main else { return }
        let v = scr.visibleFrame
        let width = min(max(w, window.minSize.width), v.width)
        window.setFrame(NSRect(x: v.minX, y: v.minY, width: width, height: v.height),
                        display: true, animate: true)
    }

    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        guard let d = m.body as? [String: Any] else { return }
        if let cmd = d["cmd"] as? String, cmd == "tile" {
            tileLeft(CGFloat(d["width"] as? Double ?? 640))
            return
        }
        let raw = d["rows"] as? [[String: Any]] ?? []
        let rows = raw.map { Row(id: $0["id"] as? String ?? "",
                                 title: $0["title"] as? String ?? "",
                                 verdict: $0["verdict"] as? String ?? "") }
        let cur = d["cur"] as? Int ?? 0
        let beat = d["beat"] as? String ?? "idle"
        sidebar.set(rows, cur: cur)
        reproButton.isEnabled = !rows.isEmpty && beat != "running"
        reproButton.title = beat == "running" ? "Running…" : "Reproduce"
        // Judging before looking stays possible, but the control is only live
        // once this finding has actually been run.
        verdict.isEnabled = !rows.isEmpty && beat != "running"
        let v = d["verdict"] as? String ?? ""
        verdict.selectedSegment = ["y": 0, "n": 1, "s": 2][v] ?? -1
    }

    // MARK: server

    func startServer() {
        let py = ["/opt/homebrew/bin/python3", "/usr/local/bin/python3", "/usr/bin/python3"]
            .first { FileManager.default.isExecutableFile(atPath: $0) } ?? "/usr/bin/python3"
        let p = Process()
        p.executableURL = URL(fileURLWithPath: py)
        p.arguments = ["-u", "\(REPO)/scripts/bench.py"]
        p.currentDirectoryURL = URL(fileURLWithPath: REPO)
        var env = ProcessInfo.processInfo.environment
        env["BENCH_PORT"] = String(port)
        env["BENCH_NO_BROWSER"] = "1"
        p.environment = env
        let pipe = Pipe()
        p.standardOutput = pipe; p.standardError = pipe
        pipe.fileHandleForReading.readabilityHandler = { [weak self] h in
            if let s = String(data: h.availableData, encoding: .utf8), !s.isEmpty {
                self?.log += s
            }
        }
        do { try p.run(); server = p }
        catch { detailVC.failed("Could not start the bench server.",
                                log: "\(error.localizedDescription)\n\nExpected: \(REPO)/scripts/bench.py") }
    }

    func waitForServer(attempt: Int) {
        guard attempt < 45 else {
            detailVC.failed("The server did not come up.",
                            log: log.isEmpty ? "No output from scripts/bench.py." : log)
            return
        }
        // /api/ping is cheap and, on first call, blocks until the reports are
        // parsed — so a reply means genuinely ready, not merely listening.
        var rq = URLRequest(url: URL(string: "http://127.0.0.1:\(port)/api/ping")!)
        rq.timeoutInterval = 20
        URLSession.shared.dataTask(with: rq) { [weak self] data, _, _ in
            guard let self else { return }
            DispatchQueue.main.async {
                if data != nil {
                    self.web.load(URLRequest(url: URL(string: "http://127.0.0.1:\(self.port)/")!))
                } else {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                        self.waitForServer(attempt: attempt + 1)
                    }
                }
            }
        }.resume()
    }

    func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
        detailVC.done()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ s: NSApplication) -> Bool { true }
    func applicationWillTerminate(_ n: Notification) {
        server?.terminate()
        server?.waitUntilExit()
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)

let menu = NSMenu()

let appItem = NSMenuItem()
menu.addItem(appItem)
let appMenu = NSMenu()
appMenu.addItem(withTitle: "About Reproducer",
                action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Hide Reproducer", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit Reproducer",
                action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
appItem.submenu = appMenu

let editItem = NSMenuItem()
menu.addItem(editItem)
let editMenu = NSMenu(title: "Edit")
editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
editMenu.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
editMenu.addItem(.separator())
editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
editItem.submenu = editMenu

let viewItem = NSMenuItem()
menu.addItem(viewItem)
let viewMenu = NSMenu(title: "View")
viewMenu.addItem(withTitle: "Reload", action: #selector(AppDelegate.reloadPage), keyEquivalent: "r")
viewMenu.addItem(withTitle: "Hide Sidebar",
                 action: #selector(NSSplitViewController.toggleSidebar(_:)), keyEquivalent: "s")
viewItem.submenu = viewMenu

app.mainMenu = menu
app.run()
