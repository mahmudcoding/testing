export default async ({page}) => {
  return await page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const out = [];
    for (const [i,pc] of pcs.entries()) {
      if (pc.connectionState === 'closed') continue;
      const s = await pc.getStats();
      const rows = [];
      s.forEach(r => { if (r.type === 'outbound-rtp')
        rows.push({kind:r.kind, ssrc:r.ssrc, bytes:r.bytesSent, packets:r.packetsSent, active:r.active, mid:r.mid}); });
      out.push({pc:i, state:pc.connectionState, senders: pc.getSenders().filter(x=>x.track).length,
                sendersLive: pc.getSenders().filter(x=>x.track && x.track.readyState==='live').length, rows});
    }
    return out;
  });
}
