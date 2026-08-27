export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const readLog = async () => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    return await page.evaluate(() => {
      const main=document.querySelector('main');
      const t=(main?.innerText||'').replace(/\s+/g,' ');
      const i=t.indexOf('ACTION');
      const seg=i>=0? t.slice(i, i+320) : t.slice(0,320);
      return { headerRow: seg.slice(0,60),
        sample: seg,
        rawKeys: [...new Set((seg.match(/\b[a-z]+\.[a-z_]+\b/g)||[]))].slice(0,5),
        cyrillic: /[а-яА-Я]/.test(seg) };
    });
  };
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({...cur.settings, language:code})});
    return r.status;
  }, code);
  out.langBefore = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return (await r.json()).settings?.language;});
  out.en = await readLog();
  out.setRu = await setLang('ru');
  out.ru = await readLog();
  out.setBack = await setLang(out.langBefore || 'en');
  out.langAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return (await r.json()).settings?.language;});
  return out;
};
