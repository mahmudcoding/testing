export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return [...main.querySelectorAll('input,textarea')].filter(vis)
      .map(x=>({type:x.type||x.tagName, aria:x.getAttribute('aria-label')||'', value:(x.value||'').slice(0,30)}));
  });
};
