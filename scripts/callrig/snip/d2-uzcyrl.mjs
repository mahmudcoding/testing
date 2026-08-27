export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  await setLang('uz-Cyrl');
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.buttonsBefore = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean);
  });
  await page.evaluate(()=>{ window.__n=[]; window.__t=setInterval(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    for(const e of document.querySelectorAll('[role=alert],[data-sonner-toast]')){
      if(!vis(e))continue; const t=(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,130);
      if(t&&!window.__n.includes(t)) window.__n.push(t);} },250); });
  const els = await page.$$('main [role=switch]');
  if (els[0]) { await els[0].click().catch(()=>{}); await page.waitForTimeout(1200); }
  out.buttonsAfterToggle = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean);
  });
  // click the LAST button in the save bar (whatever it is called)
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const bs=[...document.querySelector('main').querySelectorAll('button')].filter(vis);
    const b=bs[bs.length-1]; if(!b) return null; const l=(b.innerText||'').trim(); b.click(); return l;
  });
  out.clickedLabel = clicked;
  await page.waitForTimeout(3500);
  out.notices = await page.evaluate(()=>{clearInterval(window.__t);return window.__n;});
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ns=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text();
    return {lang:me.settings?.language, notif:ns};});
  return out;
};
