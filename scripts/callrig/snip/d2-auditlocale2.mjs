export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const readLog = async () => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    return await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      const heads=[...main.querySelectorAll('th,[role=columnheader]')].filter(vis)
        .map(h=>(h.innerText||'').trim()).filter(Boolean);
      const rows=[...main.querySelectorAll('tbody tr,[role=row]')].filter(vis)
        .map(r=>[...r.querySelectorAll('td,[role=cell]')].map(c=>(c.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)))
        .filter(r=>r.length);
      return { headers:heads, firstRows: rows.slice(0,2),
        rawKeyCells: rows.flat().filter(c=>/^[a-z]+\.[a-z_]+$/.test(c)).slice(0,4),
        jsonCells: rows.flat().filter(c=>/^\{/.test(c)).length };
    });
  };
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
    return r.status;}, code);
  out.en = await readLog();
  await setLang('ru');
  out.ru = await readLog();
  await setLang('en');
  out.restored = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return (await r.json()).settings?.language;});
  return out;
};
