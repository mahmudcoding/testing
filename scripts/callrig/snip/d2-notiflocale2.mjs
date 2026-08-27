export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
  }, code);
  await setLang('ru');
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  await page.evaluate(()=>{ window.__n=[]; window.__t=setInterval(()=>{
    const vis=e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;} return o>0.05;};
    for(const e of document.querySelectorAll('[role=alert],[data-sonner-toast],[role=status]')){
      if(!vis(e))continue; const t=(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,140);
      if(t && !window.__n.includes(t)) window.__n.push(t);} },250); });
  const els = await page.$$('main [role=switch]');
  if (els[0]) { await els[0].click().catch(()=>{}); await page.waitForTimeout(1200); }
  const save = await page.$('main button:has-text("Сохранить")');
  out.saveLabel = save ? 'Сохранить' : null;
  if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(4000); }
  out.notices = await page.evaluate(()=>{clearInterval(window.__t); return window.__n;});
  out.inlineErr = await page.evaluate(()=>{
    const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
    const i=t.search(/нельзя|невозможно|отключ.*пока|хотя бы один/i);
    return i>=0? t.slice(Math.max(0,i-60), i+180) : '(no inline error found)';
  });
  await setLang('en');
  out.serverAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});return await r.text();});
  return out;
};
