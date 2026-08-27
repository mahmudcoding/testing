export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>((x.getAttribute('aria-label')||x.innerText||'').trim())==='Language');
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(1800);
  const opts = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio],li')].filter(vis)
      .map(o=>(o.innerText||'').trim().replace(/\s+/g,' ').slice(0,30)).filter(Boolean).slice(0,10);
  });
  await page.keyboard.press('Escape');
  return { clicked, options: opts };
};
