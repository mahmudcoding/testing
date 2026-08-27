export default async ({page}) => {
  return await page.evaluate(() => {
    if (window.__tp) clearInterval(window.__tp.id);
    const t0 = performance.now();
    const rec = {samples: [], t0, wsMark: (window.__ws?.recv||[]).length};
    const id = setInterval(() => {
      const rows = [...document.querySelectorAll('[role="status"]')].map(e => ({
        t: (e.textContent||'').trim().slice(0,50), h: Math.round(e.getBoundingClientRect().height),
        sr: /sr-only/.test(e.className||'')}));
      const anyTypingText = /is typing|are typing|people are typing/i.test(document.body.innerText);
      rec.samples.push({t: Math.round(performance.now()-t0), rows, anyTypingText,
        wsN: (window.__ws?.recv||[]).length});
      if (rec.samples.length > 200) clearInterval(id);
    }, 200);
    rec.id = id;
    window.__tp = rec;
    return {started: true, vis: document.visibilityState, wsRecvSoFar: rec.wsMark};
  });
};
