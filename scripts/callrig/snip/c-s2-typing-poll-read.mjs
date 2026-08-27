export default async ({page}) => {
  return await page.evaluate(() => {
    const r = window.__tp; if (!r) return {err:'no poller'};
    clearInterval(r.id);
    const w = window.__ws || {recv:[]};
    const typingFrames = w.recv.map((x,i)=>({i, d:x.d})).filter(x=>/"type":"typing"/.test(x.d));
    const nonEmpty = r.samples.filter(s=>s.rows.some(x=>x.t!=='') || s.anyTypingText);
    return {
      samples: r.samples.length,
      spanMs: r.samples.length? r.samples[r.samples.length-1].t : 0,
      wsRecvStart: r.wsMark, wsRecvEnd: w.recv.length,
      typingFramesTotal: typingFrames.length,
      typingFramesDuringPoll: typingFrames.filter(x=>x.i>=r.wsMark).map(x=>x.d),
      samplesWithIndicatorText: nonEmpty.length,
      rowsSeen: [...new Set(r.samples.flatMap(s=>s.rows.map(x=>`h=${x.h} sr=${x.sr} text="${x.t}"`)))].slice(0,6)
    };
  });
};
