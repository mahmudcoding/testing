const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,160);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,54),s:r.status(),req:(r.request().postData()||'').slice(0,140),res:b});}});
  await page.keyboard.press('Escape').catch(()=>{});
  // open Side Rooms panel
  await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  const ap = page.locator('button', { hasText: /^Add people$/ }).first();
  out.addPeopleFound = await ap.count()>0;
  if(!out.addPeopleFound){
    out.panel = await page.evaluate((vs)=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
      return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,240):null;},VS);
    return out;
  }
  await ap.click(); await page.waitForTimeout(2200);
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,260),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,22)).filter(Boolean).slice(0,12) };},VS);
  // pick Carol and confirm
  const carol = page.locator('[role="dialog"] button', { hasText: /QA Carol/ }).first();
  if(await carol.count()){ await carol.click(); await page.waitForTimeout(900); out.pickedCarol=true; }
  for(const lbl of ['Add','Invite','Add people','Send invites','Done']){
    const b = page.locator('[role="dialog"] button', { hasText: new RegExp('^'+lbl+'$') }).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.confirmed=lbl; await page.waitForTimeout(3500); break; }
  }
  out.requests=net;
  return out;
};
