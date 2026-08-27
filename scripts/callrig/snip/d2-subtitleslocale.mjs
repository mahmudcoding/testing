export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  const sub = async (route) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${route}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    return await page.evaluate(() => {
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('›');
      const j=i>=0? t.indexOf(' ', i+2) : 0;
      return t.slice(i>=0?i:0, (i>=0?i:0)+170);
    });
  };
  await setLang('ru');
  for (const r of ['sessions','about','security','admin/workspaces','admin/company'])
    out['ru_'+r] = await sub(r);
  await setLang('en');
  out.lang = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
