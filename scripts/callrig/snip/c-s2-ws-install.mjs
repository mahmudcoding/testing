const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.addInitScript(() => {
    window.__ws = {sent: [], recv: [], sockets: 0};
    const OW = window.WebSocket;
    function Patched(...a) {
      const s = new OW(...a);
      window.__ws.sockets++;
      s.addEventListener('message', (e) => {
        try { window.__ws.recv.push({t: Math.round(performance.now()), d: String(e.data).slice(0, 220)}); } catch {}
        if (window.__ws.recv.length > 500) window.__ws.recv.shift();
      });
      const os = s.send.bind(s);
      s.send = (d) => { try { window.__ws.sent.push({t: Math.round(performance.now()), d: String(d).slice(0, 220)}); } catch {}
        if (window.__ws.sent.length > 500) window.__ws.sent.shift(); return os(d); };
      return s;
    }
    Patched.prototype = OW.prototype;
    Object.assign(Patched, OW);
    window.WebSocket = Patched;
  });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return await page.evaluate(() => ({sockets: window.__ws?.sockets, sent: window.__ws?.sent.length,
    recv: window.__ws?.recv.length, url: location.href, vis: document.visibilityState}));
};
