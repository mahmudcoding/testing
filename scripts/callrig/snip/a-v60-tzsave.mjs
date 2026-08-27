const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let body=null; try{ body=(await r.text()).slice(0,200);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,60),s:r.status(),req:(r.request().postData()||'').slice(0,220),res:body});}});
  const state = () => page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return {sw:[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).map(s=>({
      near:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,22), on:String(s.getAttribute('aria-checked')??s.checked)})),
      save:[...main.querySelectorAll('button')].filter(vis).filter(b=>/save|discard/i.test(b.innerText||'')).map(b=>b.innerText.trim()),
      toast:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,70)).filter(Boolean)};},VS);

  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  await page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    [...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis)
      .find(s=>/Show timezone/i.test(s.closest('div')?.parentElement?.innerText||''))?.click();},VS);
  await page.waitForTimeout(700);
  // click Save profile
  const btns = await page.$$('button');
  for (const b of btns){ const t=(await b.innerText().catch(()=>''))||''; if(/save profile/i.test(t)){ await b.click().catch(()=>{}); break; } }
  const poll=[]; for(let i=0;i<10;i++){ poll.push(await state()); await page.waitForTimeout(400); }
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3400);
  const afterReload = await state();
  return { afterSave: poll[poll.length-1], toastSeen: poll.find(p=>p.toast.length)?.toast ?? null, afterReload:afterReload.sw, requests:reqs };
};
