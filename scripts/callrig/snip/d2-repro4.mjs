export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900); await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.rows = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const btns=[...main.querySelectorAll('button')].filter(vis).filter(e=>!e.closest('nav,aside'))
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' '));
    const t=(main.innerText||'').replace(/\s+/g,' ');
    return { removeButtons: btns.filter(b=>/remove/i.test(b)),
      note: (t.match(/You can view company members[^.]*\./)||['(none)'])[0],
      ownerRowMentioned: /Owner/.test(t) };
  });
  return out;
};
