const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/i.test(u)&&['PATCH','PUT','POST'].includes(r.request().method())){
    let b=null;try{b=(await r.text()).slice(0,110);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,300)});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  // ALK-2473/2821/2822: the create form's date + recurrence controls
  await page.locator('button',{hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2600);
  out.recurrence = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]||document.body;
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return { repeatSection:(t.match(/Repeat[^]{0,80}/)||[''])[0],
      hasCustomRRULE:/Custom RRULE/i.test(t), allDaySwitch:/All day/i.test(t),
      durationPresets:(t.match(/15 min[^]{0,60}/)||[''])[0],
      dateInputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({type:i.type,val:(i.value||'').slice(0,22)})).filter(i=>/date|time/.test(i.type)||/\d{2}[:\/]/.test(i.val)) };},VS);
  // open the repeat chooser
  const rep = page.locator('[role="dialog"] button',{hasText:/Does not repeat/}).first();
  if(await rep.count()){ await rep.click(); await page.waitForTimeout(1800);
    out.repeatOptions = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,10);},VS);
    await page.keyboard.press('Escape').catch(()=>{}); }
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1500);
  // ALK-2982: edit a FUTURE meeting, change only the title, inspect the payload
  const chip = page.locator('[data-testid="calendar-event-chip"]',{hasText:/V60 Future/}).first();
  out.futureChip = await chip.count()>0;
  if(out.futureChip){
    await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3000);
    const ed = page.locator('[role="dialog"] button[aria-label="Edit"]').first();
    out.editFound = await ed.count()>0;
    if(out.editFound){ await ed.click(); await page.waitForTimeout(3000);
      const ti=await page.$('[role="dialog"] input');
      if(ti){ await ti.click({clickCount:3}); await page.keyboard.type('V60 Future EDITED',{delay:18}); }
      await page.waitForTimeout(800);
      for(const rx of [/^Save$/,/^Save changes$/,/^Update/,/^Schedule meeting$/]){
        const b=page.locator('[role="dialog"] button').filter({hasText:rx}).first();
        if(await b.count()){ await b.click().catch(()=>{}); out.saved=String(rx); break; } }
      await page.waitForTimeout(5000); }
  }
  out.requests=net;
  return out;
};
