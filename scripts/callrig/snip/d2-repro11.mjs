export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/workspaces`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btn = await page.$('main button:has-text("Show storage")');
  const out={ showStorageFound: !!btn };
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(3000); }
  Object.assign(out, await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('My storage');
    const heads=[...main.querySelectorAll('h1,h2,h3,h4,strong')].filter(vis)
      .map(h=>(h.innerText||'').trim()).filter(t=>/storage/i.test(t));
    return { storageHeadings: heads, block: i>=0 ? all.slice(i, i+260) : '(no "My storage" text)' };
  }));
  return out;
};
