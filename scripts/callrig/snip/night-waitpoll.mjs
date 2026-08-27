export default async ({page}) => {
  const ms = Number(process.env.QA_MS||60000);
  return await page.evaluate(async (ms) => {
    const out=[]; const t0=Date.now(); let last=null;
    while (Date.now()-t0 < ms) {
      const wc = document.querySelector('[data-testid="call-controls-waiting-count"]');
      const w = await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/waiting',{credentials:'include'})).json();
      const cur = (wc?wc.textContent.trim():'absent')+' | api='+((w.participants||[]).length);
      if (cur!==last){ out.push({at: Math.round((Date.now()-t0)/1000)+'s', ui_api: cur}); last=cur; }
      await new Promise(r=>setTimeout(r,3000));
    }
    return {timeline: out};
  }, ms);
};
