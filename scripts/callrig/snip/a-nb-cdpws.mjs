// Capture WebSocket frames on ALREADY-OPEN sockets via CDP (no reload needed).
// Renders binary payloads as printable ASCII so protobuf field values are readable.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 40000);
  const RX = new RegExp(process.env.QA_RX || 'pin', 'i');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const socks = new Map(); let n = 0;
  const out = { urls: [], hits: [], counts: {} };
  const idOf = (r) => { if (!socks.has(r)) { socks.set(r, ++n); } return socks.get(r); };
  cdp.on('Network.webSocketCreated', e => { idOf(e.requestId); out.urls.push({sock: idOf(e.requestId), u: String(e.url).replace(/access_token=[^&]*/, 'access_token=<t>').slice(0, 90)}); });
  const asc = (b64) => { try { return Buffer.from(b64, 'base64').toString('latin1').replace(/[^\x20-\x7e]+/g, '.'); } catch (e) { return ''; } };
  const rec = (dir) => (e) => {
    const s = idOf(e.requestId);
    const p = e.response && e.response.payloadData || '';
    const txt = (e.response && e.response.opcode === 2) ? asc(p) : String(p);
    const k = dir + s; out.counts[k] = (out.counts[k] || 0) + 1;
    if (RX.test(txt)) out.hits.push({ t: Date.now(), dir, sock: s, len: txt.length, txt: txt.slice(0, 220) });
  };
  cdp.on('Network.webSocketFrameReceived', rec('in'));
  cdp.on('Network.webSocketFrameSent', rec('out'));
  out.t0 = Date.now();
  await page.waitForTimeout(MS);
  out.t1 = Date.now();
  out.hits = out.hits.map(h => ({ ...h, ms: h.t - out.t0, t: undefined }));
  return out;
};
