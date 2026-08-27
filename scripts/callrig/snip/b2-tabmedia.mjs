import { HOOK } from './lib.mjs';
export default async ({ ctx }) => {
  const out = [];
  for (const p of ctx.pages()) {
    try {
      const r = await p.evaluate(async () => {
        const pcs = window.__pcs || [];
        const states = pcs.map(pc => ({ conn: pc.connectionState, ice: pc.iceConnectionState,
                                        sig: pc.signalingState }));
        let bytes = 0, inbound = 0;
        for (const pc of pcs) { try { const s = await pc.getStats();
          s.forEach(x => { if (x.type==='outbound-rtp') bytes += x.bytesSent||0;
                           if (x.type==='inbound-rtp') inbound += x.bytesReceived||0; }); } catch {} }
        return { url: location.pathname.slice(-22), pcCount: pcs.length, states,
                 outBytes: bytes, inBytes: inbound,
                 surface: !!document.querySelector('[data-testid="call-surface"]'),
                 tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
                 key: (document.body.innerText.match(/READY TO JOIN|Call ended|Leave call|Connecting|Joining/g)||[]).slice(0,3) };
      });
      out.push(r);
    } catch (e) { out.push({ err: String(e).slice(0,60) }); }
  }
  return out;
};
