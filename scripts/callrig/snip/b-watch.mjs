export default async ({page}) => {
  const id = process.env.QA_CH || 'C4QBGENERAL0001';
  const ms = parseInt(process.env.QA_MS||'20000',10);
  if (!page.url().includes(id)) {
    await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  return await page.evaluate(async (ms) => {
    const snaps = []; const t0 = Date.now();
    let prev = '';
    while (Date.now() - t0 < ms) {
      const msgs = [...document.querySelectorAll('[data-message-id]')].map(m => {
        const t = (m.innerText||'').replace(/\s+/g,' ');
        return m.getAttribute('data-message-id')+'|'+t.slice(0,80);
      });
      const toasts = [...document.querySelectorAll('*')].filter(e=>{
        const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
        return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&/toast|sonner/i.test(e.className||'');
      }).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,80)).filter(Boolean);
      const sig = JSON.stringify([msgs, toasts]);
      if (sig !== prev) { snaps.push({t: Date.now()-t0, msgs, toasts}); prev = sig; }
      await new Promise(r=>setTimeout(r,300));
    }
    return {vis: document.visibilityState, snaps};
  }, ms);
};
