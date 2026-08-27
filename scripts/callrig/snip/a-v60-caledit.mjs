const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/i.test(u)&&!['GET'].includes(r.request().method())){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,300)});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('[data-testid="calendar-event-chip"]',{hasText:/Participant Check/}).first();
  out.chip = await chip.count()>0;
  if(!out.chip) return out;
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3000);
  // find an Edit action
  for(const lbl of [/^Edit$/,/^Edit meeting$/,/Edit/]){
    const b=page.locator('[role="dialog"] button').filter({hasText:lbl}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.editClicked=String(lbl); await page.waitForTimeout(3000); break; }
  }
  out.editorButtons = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()||document.body;
    return { btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,22)).filter(Boolean).slice(0,12),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,20),val:(i.value||'').slice(0,26)})).slice(0,4) };},VS);
  // change ONLY the title
  const ti = await page.$('[role="dialog"] input');
  if(ti){ await ti.click({clickCount:3}); await page.keyboard.type('V60 Edited Title',{delay:20}); }
  await page.waitForTimeout(800);
  for(const lbl of [/^Save$/,/^Save changes$/,/^Update/]){
    const b=page.locator('[role="dialog"] button').filter({hasText:lbl}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.saveClicked=String(lbl); break; }
  }
  await page.waitForTimeout(5000);
  out.requests=net;
  return out;
};
