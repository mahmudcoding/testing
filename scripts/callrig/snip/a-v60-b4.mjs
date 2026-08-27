const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,46),s:r.status(),req:(r.request().postData()||'').slice(0,220)});}});

  // --- ALK-2982: editing a meeting sends only what changed
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('[data-testid="calendar-event-chip"]').last();
  if(await chip.count()){
    await chip.scrollIntoViewIfNeeded(); await chip.click().catch(()=>{}); await page.waitForTimeout(3000);
    const ed = page.locator('[role="dialog"] button[aria-label="Edit"]').first();
    out.editAvailable = await ed.count()>0;
    if(out.editAvailable){
      await ed.click(); await page.waitForTimeout(3200);
      net.length=0;
      const ti=await page.$('[role="dialog"] input');
      if(ti){ await ti.click({clickCount:3}); await page.keyboard.type('V60 Renamed Only',{delay:16}); }
      await page.waitForTimeout(700);
      for(const rx of [/^Save changes$/,/^Save$/,/^Update/,/^Schedule meeting$/]){
        const b=page.locator('[role="dialog"] button').filter({hasText:rx}).first();
        if(await b.count()){ await b.click().catch(()=>{}); out.saveBtn=String(rx); break; } }
      await page.waitForTimeout(5000);
      out.editPayloads = net.filter(n=>/calendar/.test(n.u||''));
    }
  }
  return out;
};
