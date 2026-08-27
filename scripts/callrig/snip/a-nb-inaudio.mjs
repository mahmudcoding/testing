export default async ({page}) => {
  return await page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const out = [];
    for (const [i,pc] of pcs.entries()) {
      if (pc.connectionState === 'closed') continue;
      const s = await pc.getStats();
      const rows = [];
      s.forEach(r => { if (r.type === 'inbound-rtp' && r.kind === 'audio')
        rows.push({ssrc:r.ssrc, bytes:r.bytesReceived, packets:r.packetsReceived,
                   level:r.audioLevel, energy:r.totalAudioEnergy, dur:r.totalSamplesDuration}); });
      out.push({pc:i, state:pc.connectionState,
                receivers: pc.getReceivers().filter(x=>x.track && x.track.kind==='audio').length, rows});
    }
    return out;
  });
}
