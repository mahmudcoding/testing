export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {status:r.status, stored:back.settings?.language};}, code);
  for (const code of ['uz','uz-Cyrl']) {
    const set = await setLang(code);
    if (set.stored !== code) { out[code]={skipped:'not accepted', set}; continue; }
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    await page.evaluate(()=>{ window.__n=[]; window.__t=setInterval(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      for(const e of document.querySelectorAll('[role=alert],[data-sonner-toast]')){
        if(!vis(e))continue; const t=(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,130);
        if(t&&!window.__n.includes(t)) window.__n.push(t);} },250); });
    const els = await page.$$('main [role=switch]');
    if (els[0]) { await els[0].click().catch(()=>{}); await page.waitForTimeout(1100); }
    const btns = await page.$$('main button');
    for (const b of btns) { const t=await b.evaluate(e=>(e.innerText||'').trim());
      if (/Saqla|Save|Сохранить/i.test(t)) { await b.click().catch(()=>{}); break; } }
    await page.waitForTimeout(3500);
    out[code] = { notices: await page.evaluate(()=>{clearInterval(window.__t);return window.__n;}),
      firstSwitchLabel: await page.evaluate(()=>{
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const s=[...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis)[0];
        let lab='',n=s,g=0; while(!lab&&n&&g++<8){const p=n.previousElementSibling; if(p){const t=(p.innerText||'').trim(); if(t){lab=t;break;}} n=n.parentElement;}
        return lab.replace(/\s+/g,' ').slice(0,50);}) };
  }
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const ns=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text();
    return {lang:me.settings?.language, notif:ns};});
  return out;
};
