export default async ({page}) => {
  return await page.evaluate(() => {
    const r = window.__rec; if (!r) return {err:'no rec'};
    const w = window.__ws||{recv:[]};
    const frames = w.recv.filter(x=>/"type":"typing"/.test(x.d)).map(x=>({t:x.t, on:/is_typing":true/.test(x.d)}));
    const hits = r.events.filter(e=>e.rows.length);
    return {
      bootEpoch: r.boot, perfT0: Math.round(r.t0),
      totalEvents: r.events.length,
      typingFrames: frames.length,
      frameTimesRel: frames.map(f=>Math.round(f.t - r.t0)+(f.on?'+':'-')),
      hitCount: hits.length,
      hits: hits.slice(0,12).map(h=>({tMs:h.t, text:h.rows.map(x=>x.t).join('/'), focus:h.focus, vis:h.vis})),
      focusSeen: [...new Set(r.events.map(e=>e.focus))],
      visSeen: [...new Set(r.events.map(e=>e.vis))]
    };
  });
};
