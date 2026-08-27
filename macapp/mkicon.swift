// Draws the app icon set. Ochre check on a deep ink rounded square — the same
// palette the bench itself uses, so the Dock icon and the window agree.
import AppKit

let sizes = [16, 32, 64, 128, 256, 512, 1024]
let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "Bench.iconset"
try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)

let ink   = NSColor(srgbRed: 0.086, green: 0.098, blue: 0.129, alpha: 1)   // #16191f
let ochre = NSColor(srgbRed: 0.835, green: 0.604, blue: 0.306, alpha: 1)   // #d59a4e

func draw(_ px: Int) -> Data {
    let img = NSImage(size: NSSize(width: px, height: px))
    img.lockFocus()
    let s = CGFloat(px)
    let inset = s * 0.055
    let r = NSBezierPath(roundedRect: NSRect(x: inset, y: inset, width: s - inset*2, height: s - inset*2),
                         xRadius: s * 0.225, yRadius: s * 0.225)
    ink.setFill(); r.fill()

    // check mark, drawn as a stroked path so it stays crisp at 16px
    let p = NSBezierPath()
    p.move(to: NSPoint(x: s * 0.29, y: s * 0.52))
    p.line(to: NSPoint(x: s * 0.44, y: s * 0.36))
    p.line(to: NSPoint(x: s * 0.73, y: s * 0.66))
    p.lineWidth = s * 0.098
    p.lineCapStyle = .round
    p.lineJoinStyle = .round
    ochre.setStroke(); p.stroke()

    img.unlockFocus()
    let tiff = img.tiffRepresentation!
    return NSBitmapImageRep(data: tiff)!.representation(using: .png, properties: [:])!
}

for s in sizes {
    try! draw(s).write(to: URL(fileURLWithPath: "\(out)/icon_\(s)x\(s).png"))
    if s <= 512 {
        try! draw(s * 2).write(to: URL(fileURLWithPath: "\(out)/icon_\(s)x\(s)@2x.png"))
    }
}
print("iconset written to \(out)")
