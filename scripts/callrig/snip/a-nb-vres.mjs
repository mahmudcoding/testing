export default async ({page}) => {
  return await page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const out = [];
    for (const pc of pcs) {
      if (pc.connectionState === 'closed') continue;
      const s = await pc.getStats();
      s.forEach(r => {
        if (r.type === 'outbound-rtp' && r.kind === 'video')
          out.push({dir:'out', rid:r.rid||null, w:r.frameWidth, h:r.frameHeight, fps:r.framesPerSecond,
                    fenc:r.framesEncoded, bytes:r.bytesSent, active:r.active, scal:r.scalabilityMode||null});
        if (r.type === 'inbound-rtp' && r.kind === 'video')
          out.push({dir:'in', w:r.frameWidth, h:r.frameHeight, fps:r.framesPerSecond,
                    fdec:r.framesDecoded, bytes:r.bytesReceived});
      });
    }
    return out;
  });
}
