export default async ({page}) => {
  const ms = Number(process.env.QA_MS||90000);
  return await page.evaluate(async (ms) => {
    const out=[]; const t0=Date.now(); let last=null;
    while (Date.now()-t0 < ms) {
      const b = document.querySelector('[data-testid="call-controls-live-reaction"]');
      const cur = b ? 'present:'+(b.disabled?'disabled':'enabled') : 'absent';
      if (cur !== last) { out.push({at: Math.round((Date.now()-t0)/1000)+'s', state: cur}); last = cur; }
      await new Promise(r=>setTimeout(r,1000));
    }
    return {timeline: out};
  }, ms);
};
