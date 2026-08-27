export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  for (const code of ['uz','uz-Cyrl']) {
    await setLang(code);
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/workspaces`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    const before = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .filter(e=>!e.closest('nav,aside'))
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,34));
    });
    // click the last content button (the storage toggle sits at the end of the card)
    const clicked = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const bs=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .filter(e=>!e.closest('nav,aside'));
      const b=bs[bs.length-1]; if(!b) return null; const l=(b.innerText||'').trim(); b.click(); return l;
    });
    await page.waitForTimeout(1800);
    out[code] = { buttons: before, clicked,
      sizes: await page.evaluate(()=>{
        const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
        return [...new Set((t.match(/\d[\d\s.,]*\s*(?:B|KB|MB|GB)\b[^|]{0,24}/g)||[]))].slice(0,3);
      }) };
  }
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
