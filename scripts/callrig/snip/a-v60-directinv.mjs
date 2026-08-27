const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/invit/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,180);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,46),s:r.status(),req:(r.request().postData()||'').slice(0,160),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const sb = await page.$('input[placeholder="Search company members"]');
  out.searchFound=!!sb;
  if(!sb) return out;
  await sb.click(); await page.keyboard.type('Outsider',{delay:60});
  await page.waitForTimeout(2600);
  out.candidates = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('button,li,[role="option"]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)).filter(t=>/Outsider/i.test(t)).slice(0,3);},VS);
  const pick = page.locator('button, li, [role="option"]').filter({hasText:/QA Outsider/}).first();
  if(await pick.count()){ await pick.click().catch(()=>{}); out.picked=true; await page.waitForTimeout(1800); }
  out.sendState = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/Send direct invites/i.test(b.innerText||''));
    return b?{t:b.innerText.trim(),disabled:b.disabled}:null;},VS);
  if(out.sendState && !out.sendState.disabled){
    await page.locator('button',{hasText:/Send direct invites/}).first().click().catch(()=>{});
    await page.waitForTimeout(5000);
  }
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return { directBlock:(t.match(/Direct invites[^]{0,200}/)||[''])[0],
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(x=>(x.innerText||'').trim().slice(0,50)).filter(Boolean) };},VS);
  return out;
};
