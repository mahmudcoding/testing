// Verify pass: Alice starts a group call from the hub, approval OFF.
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/i.test(u)&&r.request().method()==='POST'){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type(process.env.QA_CALLNAME||'VERIFY-A-1',{delay:15}); }
  // read switches, turn OFF anything about approval
  out.switchesBefore = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"] [role="switch"]')]
    .map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,46),on:s.getAttribute('aria-checked')})));
  await page.evaluate(()=>{
    [...document.querySelectorAll('[role="dialog"] [role="switch"]')].forEach(s=>{
      const lbl=(s.closest('div')?.parentElement?.innerText||'');
      if(/approval/i.test(lbl) && s.getAttribute('aria-checked')==='true') s.click();
    });
  });
  await page.waitForTimeout(700);
  out.switchesAfter = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"] [role="switch"]')]
    .map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,46),on:s.getAttribute('aria-checked')})));
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.url = await page.evaluate(()=>location.pathname);
  out.callId = out.url.split('/call/')[1]||null;
  out.requests=net;
  return out;
};
