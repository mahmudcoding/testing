const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null; try{b=(await r.text()).slice(0,150);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,45),s:r.status(),req:(r.request().postData()||'').slice(0,200),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  const toggled = await page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis)
      .find(s=>/Active status/i.test(s.closest('div')?.parentElement?.innerText||''));
    if(!s)return null; const was=String(s.getAttribute('aria-checked')??s.checked); s.click(); return was;},VS);
  await page.waitForTimeout(800);
  const btns=await page.$$('button');
  for(const b of btns){const t=(await b.innerText().catch(()=>''))||''; if(/save profile/i.test(t)){await b.click().catch(()=>{});break;}}
  await page.waitForTimeout(3000);
  const now = await page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return {sw:[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,20),on:String(s.getAttribute('aria-checked')??s.checked)})),
      toast:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').trim().slice(0,40)).filter(Boolean)};},VS);
  return { wasActiveStatus: toggled, after: now, requests: reqs };
};
