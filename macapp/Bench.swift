// Review — a Mac app around the local bench server.
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
    var area: String
    var verdict: String     // "", "y", "n"
}

/// What a sidebar line is. Findings arrive grouped by module, and a header is
/// inserted wherever the module changes — so the table's own indices no longer
/// match the finding indices, and every lookup has to go through `display`.
enum Line {
    case header(String)
    case finding(Int)       // index into rows
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
            // to the first line of the label, not the top of the row: the label is
            // centred, so a row of one line and a row of two put their first line
            // in different places and a fixed offset is above the text in both
            dot.centerYAnchor.constraint(equalTo: label.firstBaselineAnchor, constant: -4),
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
        default:  dot.layer?.backgroundColor = NSColor.quaternaryLabelColor.cgColor
        }
    }
}

/// A source list is clickable, so it should say so on hover like the buttons do.
final class HandTable: NSTableView {
    override func resetCursorRects() {
        super.resetCursorRects()
        for i in 0 ..< numberOfRows where delegate?.tableView?(self, shouldSelectRow: i) ?? true {
            addCursorRect(rect(ofRow: i), cursor: .pointingHand)
        }
    }
}

// ── sidebar ──────────────────────────────────────────────────────────────────
final class SidebarVC: NSViewController, NSTableViewDataSource, NSTableViewDelegate {
    var rows: [Row] = []
    var display: [Line] = []
    var onSelect: ((Int) -> Void)?
    let table = HandTable()
    private var suppress = false

    private func rebuild() {
        display = []
        var last = ""
        for (i, r) in rows.enumerated() {
            if r.area != last { display.append(.header(r.area)); last = r.area }
            display.append(.finding(i))
        }
    }

    private func line(forFinding i: Int) -> Int? {
        display.firstIndex { if case .finding(let j) = $0 { return j == i }; return false }
    }

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
        table.rowHeight = 44
        table.backgroundColor = .windowBackgroundColor
        table.selectionHighlightStyle = .regular
        // .inset, not .sourceList: both give the rounded inset selection, but a
        // source list is painted with the vibrant sidebar material, which samples
        // what is behind the *window* — so the desktop wallpaper tinted the whole
        // list, and a vivid one made it unreadable.
        if #available(macOS 11.0, *) { table.style = .inset }
        scroll.documentView = table
        view = scroll
    }

    func set(_ rs: [Row], cur: Int) {
        rows = rs
        rebuild()
        table.reloadData()
        table.window?.invalidateCursorRects(for: table)
        guard cur >= 0, cur < rs.count, let at = line(forFinding: cur) else { return }
        suppress = true
        table.selectRowIndexes(IndexSet(integer: at), byExtendingSelection: false)
        table.scrollRowToVisible(at)
        suppress = false
    }

    func numberOfRows(in tableView: NSTableView) -> Int { display.count }

    func tableView(_ t: NSTableView, isGroupRow row: Int) -> Bool {
        if case .header = display[row] { return true }
        return false
    }

    // a header is a label, not a destination
    func tableView(_ t: NSTableView, shouldSelectRow row: Int) -> Bool {
        !tableView(t, isGroupRow: row)
    }

    func tableView(_ t: NSTableView, heightOfRow row: Int) -> CGFloat {
        tableView(t, isGroupRow: row) ? 28 : 44
    }

    func tableView(_ t: NSTableView, viewFor col: NSTableColumn?, row: Int) -> NSView? {
        switch display[row] {
        case .header(let title):
            let id = NSUserInterfaceItemIdentifier("head")
            let v = (t.makeView(withIdentifier: id, owner: self) as? NSTableCellView) ?? {
                let c = NSTableCellView(); c.identifier = id
                let l = NSTextField(labelWithString: "")
                l.translatesAutoresizingMaskIntoConstraints = false
                l.font = .systemFont(ofSize: 11, weight: .semibold)
                l.textColor = .secondaryLabelColor
                c.addSubview(l); c.textField = l
                NSLayoutConstraint.activate([
                    l.leadingAnchor.constraint(equalTo: c.leadingAnchor),
                    l.bottomAnchor.constraint(equalTo: c.bottomAnchor, constant: -3),
                ])
                return c
            }()
            v.textField?.stringValue = title
            return v
        case .finding(let i):
            let id = NSUserInterfaceItemIdentifier("cell")
            let cell = (t.makeView(withIdentifier: id, owner: self) as? RowCell) ?? {
                let c = RowCell(frame: .zero); c.identifier = id; return c
            }()
            cell.fill(rows[i])
            return cell
        }
    }

    func tableViewSelectionDidChange(_ n: Notification) {
        guard !suppress, table.selectedRow >= 0,
              case .finding(let i) = display[table.selectedRow] else { return }
        onSelect?(i)
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
    private let panel = NSView()
    private let shade = NSView()
    private let edge  = NSView()
    private var leading: NSLayoutConstraint!
    private var panelW: NSLayoutConstraint!
    private(set) var isOpen = false
    /// The list is an overlay, so it covers the content underneath it. Whoever
    /// owns that content gets told to step aside by this much.
    var onOpenChanged: ((CGFloat) -> Void)?
    static let width: CGFloat = 250

    init(detail: NSViewController, list: NSViewController) {
        self.detail = detail; self.list = list
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError() }

    override func loadView() {
        // Leave these views layer-backed. Giving any of them a draw(_:) instead
        // stops the web view being composited at all — the sidebar renders, the
        // page still runs and syncs, and the detail pane is simply blank.
        let root = NSView()
        addChild(detail); addChild(list)

        let d = detail.view
        d.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(d)

        // a dimmer so the list reads as being in front, and a click-off target
        shade.wantsLayer = true
        shade.translatesAutoresizingMaskIntoConstraints = false
        shade.isHidden = true
        root.addSubview(shade)

        // Solid, not NSVisualEffectView: vibrancy samples what is behind the
        // *window*, and this panel sits over the app's own content, where there
        // is nothing worth showing through anyway; it carries a shadow instead.
        panel.translatesAutoresizingMaskIntoConstraints = false
        panel.wantsLayer = true
        panel.layer?.shadowOpacity = 0.28
        panel.layer?.shadowRadius = 14
        panel.layer?.shadowOffset = .zero
        root.addSubview(panel)

        // a plain layer, not NSBox(.separator): that carries an intrinsic height
        // of 1, and pinning it top-and-bottom drove the panel — and with it the
        // window — down to a single pixel
        edge.wantsLayer = true
        edge.translatesAutoresizingMaskIntoConstraints = false
        panel.addSubview(edge)

        let l = list.view
        l.translatesAutoresizingMaskIntoConstraints = false
        panel.addSubview(l)

        leading = panel.leadingAnchor.constraint(equalTo: root.leadingAnchor,
                                                 constant: -RootVC.width)
        // Set to the window's width by fitPanel(). The panel slides over the
        // content and nothing else moves: not the window, not the detail pane,
        // which stays pinned to all four edges of the root the whole time.
        panelW = panel.widthAnchor.constraint(equalToConstant: RootVC.width)
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
            panelW,
            panel.topAnchor.constraint(equalTo: root.topAnchor),
            panel.bottomAnchor.constraint(equalTo: root.bottomAnchor),

            l.leadingAnchor.constraint(equalTo: panel.leadingAnchor),
            l.trailingAnchor.constraint(equalTo: panel.trailingAnchor),
            l.topAnchor.constraint(equalTo: panel.topAnchor),
            l.bottomAnchor.constraint(equalTo: panel.bottomAnchor),
            edge.trailingAnchor.constraint(equalTo: panel.trailingAnchor),
            edge.topAnchor.constraint(equalTo: panel.topAnchor),
            edge.bottomAnchor.constraint(equalTo: panel.bottomAnchor),
            edge.widthAnchor.constraint(equalToConstant: 1),
        ])
        view = root

        let click = NSClickGestureRecognizer(target: self, action: #selector(shadeClicked))
        shade.addGestureRecognizer(click)
    }

    override func viewDidLayout() {
        super.viewDidLayout()
        fitPanel()
        paint()
    }

    /// The list is as wide as the window. It still overlays — the finding does
    /// not move under it — so at full width it simply covers the finding while
    /// it is open, and selecting a row puts it away again.
    private func fitPanel() {
        let w = view.bounds.width
        guard w > 1, abs(panelW.constant - w) > 0.5 else { return }
        panelW.constant = w
        if !isOpen { leading.constant = -w }
    }

    /// Layer colours do not follow light/dark on their own.
    private func paint() {
        view.effectiveAppearance.performAsCurrentDrawingAppearance {
            panel.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
            edge.layer?.backgroundColor = NSColor.separatorColor.cgColor
            shade.layer?.backgroundColor = NSColor.black.withAlphaComponent(0.28).cgColor
        }
    }

    @objc private func shadeClicked() { setOpen(false) }
    @objc func toggle() { setOpen(!isOpen) }

    func setOpen(_ open: Bool) {
        guard open != isOpen else { return }
        isOpen = open
        onOpenChanged?(open ? RootVC.width : 0)
        if open { shade.isHidden = false }
        NSAnimationContext.runAnimationGroup({ ctx in
            ctx.duration = 0.2
            ctx.allowsImplicitAnimation = true
            leading.animator().constant = open ? 0 : -panelW.constant
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
            detailScroll.widthAnchor.constraint(equalToConstant: 340),
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
    var current = ""            // verdict recorded for the finding on screen
    var verdictItem: NSToolbarItem!
    let reproButton = HandButton()
    let yesButton = HandButton()
    let noButton  = HandButton()

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
        window.title = "Review"          // Dock and Window menu only
        window.titleVisibility = .hidden     // not painted into the toolbar
        // Without this the window has no opaque ground: the detail pane is a web
        // view that paints its own, but the sidebar overlay sits over bare
        // window, and the desktop wallpaper came straight through the list.
        window.backgroundColor = .windowBackgroundColor
        window.isOpaque = true
        window.contentViewController = root
        // assigning contentViewController resizes the window to the view
        // controller's own size, so contentRect above does not survive it
        window.minSize = NSSize(width: 420, height: 460)

        let tb = NSToolbar(identifier: "main")
        tb.delegate = self
        tb.displayMode = .iconOnly
        tb.allowsUserCustomization = false
        window.toolbar = tb
        if #available(macOS 11.0, *) { window.toolbarStyle = .unified }

        window.setFrameAutosaveName("ReviewMain")
        let restored = window.setFrameUsingName("ReviewMain")
        window.makeKeyAndOrderFront(nil)
        if !restored {
            window.setContentSize(NSSize(width: 1180, height: 760))
            window.center()
        }
        NSApp.activate(ignoringOtherApps: true)

        // Deliberately not wired to the page. The list is an overlay: it covers the
        // left of the finding and the finding does not move. Having the page inset
        // itself by the list's width instead squeezed the text — at a 480pt window
        // that left 170px of column, one word per line, which reads as the sidebar
        // resizing the content.
        sidebar.onSelect = { [weak self] i in
            self?.web.evaluateJavaScript("window.__select && __select(\(i))")
            self?.root.setOpen(false)      // an overlay gets out of the way once used
        }
        detailVC.begin("Reading the reports…")
    }

    // MARK: toolbar

    static let idList = NSToolbarItem.Identifier("list")
    static let idNav = NSToolbarItem.Identifier("nav")
    static let idRepro = NSToolbarItem.Identifier("repro")
    static let idYes = NSToolbarItem.Identifier("yes")
    static let idNo  = NSToolbarItem.Identifier("no")

    func toolbarAllowedItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        toolbarDefaultItemIdentifiers(t)
    }

    func toolbarDefaultItemIdentifiers(_ t: NSToolbar) -> [NSToolbarItem.Identifier] {
        var ids: [NSToolbarItem.Identifier] = [AppDelegate.idList, .space, AppDelegate.idNav]
        // .space between them, not a narrower spacer of our own: the toolbar
        // paints one pill behind any run of adjacent view items, so a custom gap
        // leaves the two answers sharing a single capsule. Only a standard space
        // breaks the run, which is why they sit this far apart.
        ids += [.flexibleSpace, AppDelegate.idRepro, .space,
                AppDelegate.idYes, .space, AppDelegate.idNo]
        return ids
    }

    func toolbar(_ t: NSToolbar, itemForItemIdentifier id: NSToolbarItem.Identifier,
                 willBeInsertedIntoToolbar flag: Bool) -> NSToolbarItem? {
        switch id {
        case AppDelegate.idList:
            let b = HandButton()
            b.bezelStyle = .rounded
            b.controlSize = .large
            b.title = ""
            b.translatesAutoresizingMaskIntoConstraints = false
            b.widthAnchor.constraint(equalToConstant: 34).isActive = true
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
        case AppDelegate.idNav:
            // Borderless, not a segmented control: a segment paints a filled
            // rounded rect under the pointer, and that hover slab was the one
            // thing on the toolbar that lit up for no reason.
            func chevron(_ back: Bool) -> HandButton {
                let b = HandButton()
                b.isBordered = false
                b.bezelStyle = .rounded
                b.title = ""
                b.imagePosition = .imageOnly
                if #available(macOS 11.0, *) {
                    b.image = NSImage(systemSymbolName: back ? "chevron.left" : "chevron.right",
                                      accessibilityDescription: back ? "Previous finding" : "Next finding")
                } else { b.title = back ? "<" : ">" }
                b.toolTip = back ? "Previous finding" : "Next finding"
                b.target = self
                b.action = back ? #selector(hitPrev) : #selector(hitNext)
                b.translatesAutoresizingMaskIntoConstraints = false
                b.widthAnchor.constraint(equalToConstant: 24).isActive = true
                return b
            }
            let nav = NSStackView(views: [chevron(true), chevron(false)])
            nav.orientation = .horizontal
            nav.spacing = 2
            let itNav = NSToolbarItem(itemIdentifier: id)
            itNav.view = nav
            itNav.label = "Findings"
            return itNav
        case AppDelegate.idRepro:
            reproButton.bezelStyle = .rounded
            reproButton.controlSize = .large
            reproButton.title = ""
            reproButton.imagePosition = .imageOnly
            reproButton.target = self
            reproButton.isEnabled = false
            reproButton.translatesAutoresizingMaskIntoConstraints = false
            reproButton.widthAnchor.constraint(equalToConstant: 34).isActive = true
            let it = NSToolbarItem(itemIdentifier: id)
            it.view = reproButton
            it.label = "Reproduce"
            reproItem = it
            return it
        case AppDelegate.idYes, AppDelegate.idNo:
            let yes = (id == AppDelegate.idYes)
            let b = yes ? yesButton : noButton
            b.bezelStyle = .rounded
            b.controlSize = .large
            b.setButtonType(.pushOnPushOff)
            b.title = ""
            b.imagePosition = .imageOnly
            if #available(macOS 11.0, *) {
                b.image = NSImage(systemSymbolName: yes ? "checkmark" : "xmark",
                                  accessibilityDescription: yes ? "Confirmed" : "Not a bug")
            } else { b.title = yes ? "Yes" : "No" }
            b.target = self
            b.action = yes ? #selector(hitYes) : #selector(hitNo)
            b.isEnabled = false
            b.translatesAutoresizingMaskIntoConstraints = false
            b.widthAnchor.constraint(equalToConstant: 34).isActive = true
            let itV = NSToolbarItem(itemIdentifier: id)
            itV.view = b
            itV.label = yes ? "Confirmed" : "Not a bug"
            itV.toolTip = yes ? "This is a real bug (Y)" : "This is not a bug (N)"
            return itV
        default:
            return nil
        }
    }

    @objc func toggleList() { root.toggle() }

    @objc func saveRecord() { web.evaluateJavaScript("window.__save && __save()") }

    @objc func hitClose() { web.evaluateJavaScript("window.__close && __close()") }

    @objc func hitRepro() { web.evaluateJavaScript("window.__repro && __repro()") }
    @objc func hitPrev() { web.evaluateJavaScript("window.__step && __step(-1)") }
    @objc func hitNext() { web.evaluateJavaScript("window.__step && __step(1)") }

    /// Clicking the verdict already recorded clears it. A segmented control has
    /// no other way back from a mis-click, and the only alternative — picking
    /// the opposite verdict — puts a wrong judgement on record to undo a wrong
    /// judgement.
    // pressing the verdict already recorded clears it, so a mis-click does not
    // have to be undone by putting the opposite wrong verdict on record
    @objc func hitYes() { setVerdict(current == "y" ? "" : "y") }
    @objc func hitNo()  { setVerdict(current == "n" ? "" : "n") }

    private func setVerdict(_ v: String) {
        web.evaluateJavaScript("window.__verdict && __verdict('\(v)')")
    }

    @objc func reloadPage() { web.reload() }

    // MARK: bridge

    /// Park this window on the left of the screen. The rig browser takes the
    /// right in the same pass, so neither covers the other while a run is
    /// watched -- see scripts/callrig/snip/_tile.mjs.
    func tileLeft(_ w: CGFloat) {
        guard let scr = window.screen ?? NSScreen.main else { return }
        let v = scr.visibleFrame
        // setFrame bypasses minSize, and this frame is autosaved. A degenerate
        // visibleFrame — which happens around screen changes and at launch —
        // therefore saved a 640x1 window that came back invisible on next start.
        guard v.width >= window.minSize.width, v.height >= window.minSize.height else { return }
        let width = min(max(w, window.minSize.width), v.width)
        let height = max(window.minSize.height, v.height)
        window.setFrame(NSRect(x: v.minX, y: v.minY, width: width, height: height),
                        display: true, animate: true)
    }

    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) {
        guard let d = m.body as? [String: Any] else { return }
        if let cmd = d["cmd"] as? String {
            switch cmd {
            case "tile":
                tileLeft(CGFloat(d["width"] as? Double ?? 480))
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
                                 area: $0["area"] as? String ?? "—",
                                 verdict: $0["verdict"] as? String ?? "") }
        let cur = d["cur"] as? Int ?? 0
        detailVC.done()
        // busy is global: a run on ANY finding keeps these controls off. The
        // per-finding beat let a second run start after stepping to the next
        // finding, and two concurrent runs wreck each other's rig state.
        let busy = d["busy"] as? Bool ?? false
        sidebar.set(rows, cur: cur)
        reproButton.isEnabled = !rows.isEmpty && !busy
        // Judging before looking stays possible, but the control is only live
        // once this finding has actually been run.
        // one control: it offers to run the finding, or to put away the browser
        // that run opened — never both, because only one is ever possible
        let canClose = d["canClose"] as? Bool ?? false
        if #available(macOS 11.0, *) {
            reproButton.image = NSImage(
                systemSymbolName: canClose ? "xmark.circle" : "play.fill",
                accessibilityDescription: canClose ? "Close the browser" : "Reproduce")
        }
        reproButton.action = canClose ? #selector(hitClose) : #selector(hitRepro)
        reproButton.toolTip = canClose ? "Close the browser this run opened"
                                       : "Drive the browser to this defect (R)"
        let live = !rows.isEmpty && !busy
        yesButton.isEnabled = live
        noButton.isEnabled = live
        let v = d["verdict"] as? String ?? ""
        current = v
        // green for a confirmed bug, red for a rejected one: the verdict is the
        // output of the whole session, so it should be readable at a glance
        yesButton.state = v == "y" ? .on : .off
        noButton.state  = v == "n" ? .on : .off
        yesButton.bezelColor = v == "y" ? .systemGreen : nil
        noButton.bezelColor  = v == "n" ? .systemRed : nil
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
appMenu.addItem(withTitle: "About Review",
                action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Hide Review", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit Review",
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
