export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
  }, code);
  const read = async (route) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${route}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3600);
    return await page.evaluate(() => {
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.search(/Admin access required|Нужны права|Требуются права|доступ/i);
      return i>=0? t.slice(i, i+210) : t.slice(-210);
    });
  };
  out.en_audit = await read('admin/audit-log');
  out.en_roles = await read('roles?scope=company');
  await setLang('ru');
  out.ru_audit = await read('admin/audit-log');
  out.ru_roles = await read('roles?scope=company');
  await setLang('en');
  out.lang = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
