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

/// AppKit leaves the arrow over buttons; the web card now shows a hand, and a
/// cursor that changes on one control and not its neighbour is worse than
/// either rule applied consistently.
final class HandButton: NSButton {
    override func resetCursorRects() { addCursorRect(bounds, cursor: .pointingHand) }
}

final class HandSegmented: NSSegmentedControl {
    override func resetCursorRects() { addCursorRect(bounds, cursor: .pointingHand) }
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

/// A progress bar drawn on layers, because NSProgressIndicator animates toward
/// its value on its own schedule and fights anything that drives it — which is
/// what made the launch bar creep and stop short. One Core Animation run from
/// where it is to where it is going is smooth by construction.
final class BarView: NSView {
    private let track = CALayer()
    private let fill = CALayer()

    override init(frame: NSRect) {
        super.init(frame: frame)
        wantsLayer = true
        layer?.addSublayer(track)
        track.addSublayer(fill)
        fill.anchorPoint = CGPoint(x: 0, y: 0.5)
    }
    required init?(coder: NSCoder) { fatalError() }

    override func layout() {
        super.layout()
        let h = bounds.height
        CATransaction.begin(); CATransaction.setDisableActions(true)
        track.frame = bounds
        track.cornerRadius = h / 2
        track.backgroundColor = NSColor.quaternaryLabelColor.cgColor
        fill.cornerRadius = h / 2
        fill.backgroundColor = NSColor.controlAccentColor.cgColor
        fill.position = CGPoint(x: 0, y: h / 2)
        fill.bounds.size.height = h
        CATransaction.commit()
    }

    /// Fraction of the track currently painted, read from what is on screen.
    var shown: CGFloat {
        guard bounds.width > 0 else { return 0 }
        return ((fill.presentation() ?? fill).bounds.width) / bounds.width
    }

    func animate(to target: CGFloat, over seconds: CFTimeInterval,
                 timing: CAMediaTimingFunctionName = .easeOut) {
        let from = (fill.presentation() ?? fill).bounds.width
        let to = bounds.width * max(0, min(1, target))
        fill.removeAllAnimations()
        CATransaction.begin(); CATransaction.setDisableActions(true)
        fill.bounds.size.width = to
        CATransaction.commit()
        let a = CABasicAnimation(keyPath: "bounds.size.width")
        a.fromValue = from
        a.toValue = to
        a.duration = seconds
        a.timingFunction = CAMediaTimingFunction(name: timing)
        fill.add(a, forKey: "grow")
    }

    func reset() {
        fill.removeAllAnimations()
        CATransaction.begin(); CATransaction.setDisableActions(true)
        fill.bounds.size.width = 0
        CATransaction.commit()
    }
}

/// Root view: the detail pane fills the window and the sidebar slides in over
/// it. A split view would take its width out of the content, which on a window
/// tiled to half the screen leaves the finding unreadable — so the list is an
/// overlay, and it starts closed.
final class RootVC: NSViewController {
    private let detail: NSViewController
    private let list: NSViewController
    private let panel = NSVisualEffectView()
    private let shade = NSView()
    private var leading: NSLayoutConstraint!
    private(set) var isOpen = false
    static let width: CGFloat = 250

    init(detail: NSViewController, list: NSViewController) {
        self.detail = detail; self.list = list
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError() }

    override func loadView() {
        let root = NSView()
        addChild(detail); addChild(list)

        let d = detail.view
        d.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(d)

        // a dimmer so the list reads as being in front, and a click-off target
        shade.wantsLayer = true
        shade.layer?.backgroundColor = NSColor.black.withAlphaComponent(0.18).cgColor
        shade.translatesAutoresizingMaskIntoConstraints = false
        shade.isHidden = true
        root.addSubview(shade)

        panel.material = .sidebar
        panel.blendingMode = .behindWindow
        panel.state = .active
        panel.translatesAutoresizingMaskIntoConstraints = false
        panel.wantsLayer = true
        panel.layer?.shadowOpacity = 0.28
        panel.layer?.shadowRadius = 14
        panel.layer?.shadowOffset = .zero
        root.addSubview(panel)

        let l = list.view
        l.translatesAutoresizingMaskIntoConstraints = false
        panel.addSubview(l)

        leading = panel.leadingAnchor.constraint(equalTo: root.leadingAnchor,
                                                 constant: -RootVC.width)
        NSLayoutConstraint.activate([
            d.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            d.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            d.topAnchor.constraint(equalTo: root.topAnchor),
            d.bottomAnchor.constraint(equalTo: root.bottomAnchor),

            shade.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            shade.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            shade.topAnchor.constraint(equalTo: root.topAnchor),
            shade.bottomAnchor.constraint(equalTo: root.bottomAnchor),

            leading,
            panel.widthAnchor.constraint(equalToConstant: RootVC.width),
            panel.topAnchor.constraint(equalTo: root.topAnchor),
            panel.bottomAnchor.constraint(equalTo: root.bottomAnchor),

            l.leadingAnchor.constraint(equalTo: panel.leadingAnchor),
            l.trailingAnchor.constraint(equalTo: panel.trailingAnchor),
            l.topAnchor.constraint(equalTo: panel.topAnchor),
            l.bottomAnchor.constraint(equalTo: panel.bottomAnchor),
        ])
        view = root

        let click = NSClickGestureRecognizer(target: self, action: #selector(shadeClicked))
        shade.addGestureRecognizer(click)
    }

    @objc private func shadeClicked() { setOpen(false) }
    @objc func toggle() { setOpen(!isOpen) }

    func setOpen(_ open: Bool) {
        guard open != isOpen else { return }
        isOpen = open
        if open { shade.isHidden = false }
        NSAnimationContext.runAnimationGroup({ ctx in
            ctx.duration = 0.2
            ctx.allowsImplicitAnimation = true
            leading.animator().constant = open ? 0 : -RootVC.width
            shade.animator().alphaValue = open ? 1 : 0
            view.layoutSubtreeIfNeeded()
        }, completionHandler: { [weak self] in
            if !open { self?.shade.isHidden = true }
        })
    }
}

/// Detail pane: the web view, with a native launch panel over it until the
/// server is up. A page pretending to be a launch screen would flash white and
/// show the wrong font before the real one loads.
final class DetailVC: NSViewController {
    let web: WKWebView
    private let overlay = NSView()
    private let phase = NSTextField(labelWithString: "")
    private let bar = BarView()
    private let detail = NSTextField(wrappingLabelWithString: "")
    private let detailScroll = NSScrollView()
    private var easer: Timer?
    private var finished = false

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
            bar.heightAnchor.constraint(equalToConstant: 6),
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
        finished = false
        overlay.isHidden = false
        overlay.alphaValue = 1
        phase.stringValue = text
        phase.textColor = .secondaryLabelColor
        bar.isHidden = false
        detailScroll.isHidden = true
        bar.reset()
        bar.layoutSubtreeIfNeeded()
        // one decelerating run to 0.92: fast early, always moving, never arrives
        bar.animate(to: 0.92, over: 16)
        easer?.invalidate()
        var ticks = 0
        let t = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            ticks += 1
            if ticks == 10 { self?.phase.stringValue = "Still reading the reports…" }
            if ticks == 32 { self?.phase.stringValue = "Taking longer than usual…" }
        }
        RunLoop.main.add(t, forMode: .common)
        easer = t
    }

    func failed(_ text: String, log: String) {
        easer?.invalidate(); easer = nil
        finished = true
        overlay.isHidden = false
        overlay.alphaValue = 1
        phase.stringValue = text
        phase.textColor = .systemRed
        bar.isHidden = true
        detail.stringValue = log
        detailScroll.isHidden = log.isEmpty
    }

    /// Carry the bar from wherever it is to full in one run, hold it there long
    /// enough to be read as finished, then fade the panel.
    func done() {
        guard !finished else { return }
        finished = true
        easer?.invalidate(); easer = nil
        phase.stringValue = "Ready"
        bar.animate(to: 1, over: 0.34, timing: .easeInEaseOut)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.62) { [weak self] in
            guard let self else { return }
            NSAnimationContext.runAnimationGroup({ ctx in
                ctx.duration = 0.24
                self.overlay.animator().alphaValue = 0
            }, completionHandler: { self.overlay.isHidden = true })
        }
    }
}

// ── app ──────────────────────────────────────────────────────────────────────
final class AppDelegate: NSObject, NSApplicationDelegate, NSToolbarDelegate,
                         WKNavigationDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var web: WKWebView!
    var root: RootVC!
    var detailVC: DetailVC!
    var sidebar = SidebarVC()
    var server: Process?
    var port = 0
    var log = ""

    var reproItem: NSToolbarItem!
    var verdictItem: NSToolbarItem!
    let reproButton = HandButton()
    let closeButton = HandButton()
    let verdict = HandSegmented(labels: ["Confirmed", "Not a bug", "Skip"],
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

        detailVC = DetailVC(web: web)
        root = RootVC(detail: detailVC, list: sidebar)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1020, height: 700),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.title = "Reproducer"          // Dock and Window menu only
        window.titleVisibility = .hidden     // not painted into the toolbar
        window.contentViewController = root
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
        NSApp.activate(ignoringOtherApps: true)

        sidebar.onSelect = { [weak self] i in
            self?.web.evaluateJavaScript("window.__select && __select(\(i))")
            self?.root.setOpen(false)      // an overlay gets out of the way once used
        }
        detailVC.begin("Reading the reports…")
    }

    // MARK: toolbar

    static let idList = NSToolbarItem.Identifier("list")
    static let idClose = NSToolbarItem.Identifier("closebr")
    static let idRepro = NSToolbarItem.Identifier("repro")
    static let idVerdict = NSToolbarItem.Identifier("verdict")

    func toolbarAllowedItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        toolbarDefaultItemIdentifiers(t)
    }

    func toolbarDefaultItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        var ids: [NSToolbarItem.Identifier] = [AppDelegate.idList]
        ids += [.flexibleSpace, AppDelegate.idClose, AppDelegate.idVerdict]
        return ids
    }

    func toolbar(_ t: NSToolbar, itemForItemIdentifier id: NSToolbarItem.Identifier,
                 willBeInsertedIntoToolbar flag: Bool) -> NSToolbarItem? {
        switch id {
        case AppDelegate.idList:
            let b = HandButton()
            b.bezelStyle = .texturedRounded
            b.title = ""
            if #available(macOS 11.0, *) {
                b.image = NSImage(systemSymbolName: "sidebar.leading", accessibilityDescription: "Findings")
            } else { b.title = "List" }
            b.target = self
            b.action = #selector(toggleList)
            let it = NSToolbarItem(itemIdentifier: id)
            it.view = b
            it.label = "Findings"
            it.toolTip = "Show the list of findings"
            return it
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
        case AppDelegate.idClose:
            closeButton.bezelStyle = .texturedRounded
            if #available(macOS 11.0, *) {
                closeButton.image = NSImage(systemSymbolName: "xmark.circle",
                                            accessibilityDescription: "Close the browser")
            } else { closeButton.title = "Close" }
            closeButton.target = self
            closeButton.action = #selector(hitClose)
            closeButton.isEnabled = false
            let it = NSToolbarItem(itemIdentifier: id)
            it.view = closeButton
            it.label = "Close"
            it.toolTip = "Close the browser this run opened"
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

    @objc func toggleList() { root.toggle() }

    @objc func saveRecord() { web.evaluateJavaScript("window.__save && __save()") }

    @objc func hitClose() { web.evaluateJavaScript("window.__close && __close()") }

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
        if let cmd = d["cmd"] as? String {
            switch cmd {
            case "tile":
                tileLeft(CGFloat(d["width"] as? Double ?? 640))
                return
            case "saved":
                let a = NSAlert()
                a.messageText = "Record saved"
                a.informativeText = d["path"] as? String ?? ""
                a.addButton(withTitle: "OK")
                a.beginSheetModal(for: window, completionHandler: nil)
                return
            default: return
            }
        }
        let raw = d["rows"] as? [[String: Any]] ?? []
        let rows = raw.map { Row(id: $0["id"] as? String ?? "",
                                 title: $0["title"] as? String ?? "",
                                 verdict: $0["verdict"] as? String ?? "") }
        let cur = d["cur"] as? Int ?? 0
        detailVC.done()
        let beat = d["beat"] as? String ?? "idle"
        sidebar.set(rows, cur: cur)
        reproButton.isEnabled = !rows.isEmpty && beat != "running"
        reproButton.title = beat == "running" ? "Running…" : "Reproduce"
        // Judging before looking stays possible, but the control is only live
        // once this finding has actually been run.
        closeButton.isEnabled = d["canClose"] as? Bool ?? false
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

    // didFinish fires when the document loads, which is before the page has
    // fetched the findings and drawn anything. The first sync from the page is
    // the moment there is something to look at.
    func webView(_ w: WKWebView, didFinish n: WKNavigation!) {}

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

let fileItem = NSMenuItem()
menu.addItem(fileItem)
let fileMenu = NSMenu(title: "File")
fileMenu.addItem(withTitle: "Save Record…",
                 action: #selector(AppDelegate.saveRecord), keyEquivalent: "s")
fileItem.submenu = fileMenu

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
viewMenu.addItem(withTitle: "Findings",
                 action: #selector(AppDelegate.toggleList), keyEquivalent: "l")
viewItem.submenu = viewMenu

app.mainMenu = menu
app.run()
