const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/workspace/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,240);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/workspaces',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.page = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,14) };},VS);
  // open create dialog
  for(const lbl of ['Create workspace','New workspace','Add workspace','Create']){
    const b=page.locator('button',{hasText:new RegExp('^'+lbl+'$','i')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.opened=lbl; await page.waitForTimeout(2200); break; }
  }
  if(!out.opened) return out;
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26)})),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean) };},VS);
  // type the DUPLICATE name
  const inp = await page.$('[role="dialog"] input');
  if(inp){ await inp.click(); await page.keyboard.type('QA Workspace',{delay:30}); }
  await page.waitForTimeout(900);
  for(const lbl of ['Create','Create workspace','Save']){
    const b=page.locator('[role="dialog"] button',{hasText:new RegExp('^'+lbl+'$','i')}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.submitted=lbl; break; }
  }
  const poll=[]; for(let i=0;i<10;i++){ poll.push(await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return { open:!!d, errs:d?[...d.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/exists|taken|already|conflict|error|duplicate/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,60)):[] };},VS)); await page.waitForTimeout(500); }
  out.errorSeen = poll.find(p=>p.errs.length)?.errs ?? null;
  out.dialogStillOpen = poll[poll.length-1].open;
  out.requests=net;
  return out;
};
