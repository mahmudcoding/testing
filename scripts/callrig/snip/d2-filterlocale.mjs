export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
    return r.status;}, code);
  const tryFilter = async (term) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    const inp = await page.$('input[type="search"], input[placeholder*="ильтр"], input[placeholder*="ilter"]');
    if (!inp) return {found:false};
    await inp.click(); await page.keyboard.type(term);
    await page.waitForTimeout(1600);
    return await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
        .map(a=>(a.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      return { found:true, visibleNav:links.slice(0,10), count:links.length,
        emptyState:/ничего не найдено|nothing found|no results|no matches/i.test(t) };
    });
  };
  await setLang('ru');
  out.ru_privacy = await tryFilter('Приватность');
  out.ru_roles   = await tryFilter('Роли');
  await setLang('en');
  out.en_privacy = await tryFilter('Privacy');
  out.lang = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return (await r.json()).settings?.language;});
  return out;
};
