export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  for (const code of ['en','ru','uz','uz-Cyrl']) {
    await setLang(code);
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    out[code] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const heads=[...main.querySelectorAll('th,[role=columnheader]')].filter(vis).map(h=>(h.innerText||'').trim());
      const rows=[...main.querySelectorAll('tbody tr')].filter(vis);
      const cells=rows.length? [...rows[0].querySelectorAll('td')].map(c=>(c.innerText||'').trim().slice(0,34)) : [];
      // the date cell is the one that parses as a date-ish string
      const dateCell=cells.find(c=>/\d{4}/.test(c)) || '(none)';
      return { headers:heads.slice(0,5), date:dateCell };
    });
  }
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
