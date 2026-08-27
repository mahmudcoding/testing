export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const tryFilter = async (term) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    const inp = await page.$('input[type="search"], input[placeholder*="ilter"]');
    if (!inp) return '(no filter input)';
    await inp.click(); await page.keyboard.type(term);
    await page.waitForTimeout(1400);
    return await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
        .map(a=>(a.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      return links.slice(0,6);
    });
  };
  for (const term of ['privacy','PRIVACY','priv','  Privacy','secur','zzz']) {
    out[JSON.stringify(term)] = await tryFilter(term);
  }
  return out;
};
