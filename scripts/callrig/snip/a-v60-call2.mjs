const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('Guest Pass '+Math.floor(Date.now()/1000%100000),{delay:18}); }
  // choose "Anyone can join" style access if a Public option exists
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(8000);
  out.url = await page.evaluate(()=>location.pathname);
  out.callId = out.url.split('/call/')[1] || null;
  out.requests = net;
  return out;
};
