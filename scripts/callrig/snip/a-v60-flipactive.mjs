const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const reqs=[]; page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,90);}catch(e){}
    reqs.push({u:u.split('/api/v1/')[1].slice(0,42),s:r.status(),req:(r.request().postData()||'').slice(0,90),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  const was = await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...m.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).find(s=>/Active status/i.test(s.closest('div')?.parentElement?.innerText||''));
    const w=String(s.getAttribute('aria-checked')??s.checked); s.click(); return w;},VS);
  await page.waitForTimeout(800);
  for(const b of await page.$$('button')){const t=(await b.innerText().catch(()=>''))||'';if(/save profile/i.test(t)){await b.click().catch(()=>{});break;}}
  await page.waitForTimeout(2500);
  const now = await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...m.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).find(s=>/Active status/i.test(s.closest('div')?.parentElement?.innerText||''));
    return String(s.getAttribute('aria-checked')??s.checked);},VS);
  return { activeStatus: was+' -> '+now, requests: reqs };
};
