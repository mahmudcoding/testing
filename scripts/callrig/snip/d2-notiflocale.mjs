export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});
    return r.status;}, code);
  out.before = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});return await r.text();});
  await setLang('ru');
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/notifications`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.switches = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    return [...main.querySelectorAll('[role=switch]')].filter(vis).map((s,i)=>{
      let lab=s.getAttribute('aria-label')||'', n=s, g=0;
      while(!lab&&n&&g++<8){const p=n.previousElementSibling; if(p){const t=(p.innerText||'').trim(); if(t){lab=t;break;}} n=n.parentElement;}
      return {i, label:lab.replace(/\s+/g,' ').slice(0,44), on:s.getAttribute('aria-checked')};
    });
  });
  const els = await page.$$('main [role=switch]');
  if (els[0]) { await els[0].click().catch(()=>{}); await page.waitForTimeout(1200); }
  const save = await page.$('main button:has-text("Сохранить"), main button:has-text("Save")');
  out.saveFound = !!save;
  if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(3500); }
  out.message = await page.evaluate(()=>{
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    const m=t.match(/[^.]*(?:уведомлен|доставк|канал|notification|delivery)[^.]*\./g)||[];
    return [...new Set(m)].slice(0,4);
  });
  await setLang('en');
  out.langAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  out.serverAfter = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});return await r.text();});
  return out;
};
