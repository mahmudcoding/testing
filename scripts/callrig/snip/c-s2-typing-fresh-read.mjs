export default async ({page}) => {
  return await page.evaluate(() => {
    const r = window.__tpBoot; if (!r) return {err:'no boot poller'};
    clearInterval(r.id);
    const w = window.__ws||{recv:[],sent:[]};
    const hit = r.samples.filter(s=>s.rows.some(x=>x.t!==''));
    const frames = w.recv.filter(x=>/"type":"typing"/.test(x.d));
    return {samples:r.samples.length, spanMs: r.samples.length? r.samples[r.samples.length-1].t:0,
      typingFrames: frames.length, frameSample: frames.slice(0,3).map(f=>f.d),
      samplesWithText: hit.length,
      firstHitAtMs: hit.length? hit[0].t : null, lastHitAtMs: hit.length? hit[hit.length-1].t : null,
      texts: [...new Set(hit.flatMap(s=>s.rows.map(x=>x.t)).filter(Boolean))].slice(0,4),
      sent: w.sent.map(x=>x.d).slice(0,4)};
  });
};
