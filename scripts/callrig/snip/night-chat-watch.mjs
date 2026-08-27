export default async ({page}) => {
  const ms = Number(process.env.QA_MS||30000);
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate(async (ms) => {
    const out=[]; const t0=Date.now(); let last=null;
    const snap=()=>JSON.stringify([...document.querySelectorAll('[data-testid="ic-user-message"]')].map(r=>r.innerText.replace(/\n+/g,' | ').slice(0,90)));
    last = snap(); out.push({at:'0s', rows: JSON.parse(last)});
    while (Date.now()-t0<ms){
      await new Promise(r=>setTimeout(r,400));
      const c=snap(); if(c!==last){ out.push({at: Math.round((Date.now()-t0)/100)/10+'s', rows: JSON.parse(c)}); last=c; }
    }
    return {timeline: out};
  }, ms);
};
