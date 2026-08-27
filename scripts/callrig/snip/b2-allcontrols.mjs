export default async ({ page }) => {
  const url = process.env.QA_URL;
  if (url) { await page.goto(url, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000); }
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const all = [...document.querySelectorAll('button,a,[role="button"],[role="menuitem"]')].filter(v)
      .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
                 al:(b.getAttribute('aria-label')||'').slice(0,30),
                 tid:b.getAttribute('data-testid') }))
      .filter(b=>b.t||b.al||b.tid);
    return { total: all.length, controls: all,
             hasCallAgain: all.some(b=>/call again/i.test(b.t + ' ' + b.al)) };
  });
};
