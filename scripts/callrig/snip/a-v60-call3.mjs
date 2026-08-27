export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/i.test(u)&&r.request().method()==='POST'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('Share Pass '+Math.floor(Date.now()/1000%100000),{delay:18}); }
  // turn OFF "Require approval to join" if present so peers join straight in
  const ap = page.locator('[role="dialog"] [role="switch"]').first();
  out.switches = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"] [role="switch"]')]
    .map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40),on:s.getAttribute('aria-checked')})));
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.url = await page.evaluate(()=>location.pathname);
  out.callId = out.url.split('/call/')[1]||null;
  out.requests=net;
  return out;
};
