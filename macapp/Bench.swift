// Verification Bench — a native shell around the local bench server.
//
// Starts scripts/bench.py on a free port, shows it in a real window, and stops
// the server when the window closes. No dependencies beyond the system.

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

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var web: WKWebView!
    var server: Process?
    var port = 0
    var log = ""

    func applicationDidFinishLaunching(_ n: Notification) {
        port = freePort()
        buildWindow()
        startServer()
        waitForServer(attempt: 0)
    }

    func buildWindow() {
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1180, height: 860),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.title = "Verification Bench"
        window.titlebarAppearsTransparent = true
        window.minSize = NSSize(width: 720, height: 560)
        window.center()
        window.setFrameAutosaveName("BenchWindow")

        let cfg = WKWebViewConfiguration()
        cfg.defaultWebpagePreferences.allowsContentJavaScript = true
        web = WKWebView(frame: .zero, configuration: cfg)
        web.navigationDelegate = self
        web.setValue(false, forKey: "drawsBackground")
        window.contentView = web
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        showStatus("Starting the bench…", detail: "")
    }

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
        catch { showStatus("Could not start the bench server.",
                           detail: "\(error.localizedDescription)\n\nExpected: \(REPO)/scripts/bench.py") }
    }

    func waitForServer(attempt: Int) {
        guard attempt < 60 else {
            showStatus("The bench server did not come up.",
                       detail: log.isEmpty ? "No output from scripts/bench.py." : log)
            return
        }
        var rq = URLRequest(url: URL(string: "http://127.0.0.1:\(port)/api/findings")!)
        rq.timeoutInterval = 1.2
        URLSession.shared.dataTask(with: rq) { [weak self] data, _, _ in
            guard let self else { return }
            DispatchQueue.main.async {
                if data != nil {
                    self.web.load(URLRequest(url: URL(string: "http://127.0.0.1:\(self.port)/")!))
                } else {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
                        self.waitForServer(attempt: attempt + 1)
                    }
                }
            }
        }.resume()
    }

    func showStatus(_ title: String, detail: String) {
        let esc = { (s: String) in s
            .replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;") }
        web.loadHTMLString("""
        <html><head><meta name="color-scheme" content="light dark"><style>
        :root{color-scheme:light dark}
        body{margin:0;height:100vh;display:flex;flex-direction:column;justify-content:center;
          align-items:center;gap:14px;font:400 15px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;
          background:Canvas;color:CanvasText;padding:40px;text-align:center}
        h1{margin:0;font-size:17px;font-weight:600}
        pre{font:400 12px/1.6 ui-monospace,Menlo,monospace;opacity:.65;max-width:70ch;
          white-space:pre-wrap;text-align:left;margin:0}
        </style></head><body><h1>\(esc(title))</h1><pre>\(esc(detail))</pre></body></html>
        """, baseURL: nil)
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
appMenu.addItem(withTitle: "About Verification Bench", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Reload", action: #selector(WKWebView.reload(_:)), keyEquivalent: "r")
appMenu.addItem(.separator())
appMenu.addItem(withTitle: "Quit Verification Bench", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
appItem.submenu = appMenu
app.mainMenu = menu

app.run()
