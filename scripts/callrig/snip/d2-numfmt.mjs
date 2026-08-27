export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  for (const code of ['en','uz','uz-Cyrl','ru']) {
    await setLang(code);
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/workspaces`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2800);
    const btn = await page.$('main button:has-text("Show storage"), main button:has-text("Xotira"), main button:has-text("хранилищ"), main button:has-text("Хотира")');
    if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1600); }
    out[code] = await page.evaluate(() => {
      const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
      const sizes=[...new Set((t.match(/\d[\d\s.,]*\s*(?:B|KB|MB|GB|ТБ|ГБ|МБ)\b[^|]{0,18}/g)||[]))].slice(0,3);
      const counts=[...new Set((t.match(/\b\d{1,3}(?:[ ,.]\d{3})+\b/g)||[]))].slice(0,3);
      return { sizes, bigNumbers: counts };
    });
  }
  // also raw Intl number formatting
  out.intl = await page.evaluate(()=>{
    const o={};
    for (const l of ['en','ru','uz','uz-Cyrl'])
      o[l]={num:new Intl.NumberFormat(l).format(1234567.89),
            pct:new Intl.NumberFormat(l,{style:'percent'}).format(0.42)};
    return o;
  });
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
