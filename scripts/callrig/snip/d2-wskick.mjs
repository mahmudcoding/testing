export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000);
  for (const p of ['admin/members','workspace']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${p}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    out[p] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main')||document.body;
      const all=(main.innerText||'').replace(/\s+/g,' ');
      const i=all.indexOf('Settings ›'); const c=(i>=0?all.slice(i):all);
      const btns=[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      return { note:c.slice(0,200), buttons:btns.slice(0,16),
        removeLike: btns.filter(b=>/remove|kick|delete/i.test(b)),
        rows:[...main.querySelectorAll('[role=row],tbody tr')].filter(vis).length };
    });
  }
  return out;
};
