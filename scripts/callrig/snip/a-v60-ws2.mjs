const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/workspace/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/workspaces',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Create workspace$/}).first().click();
  await page.waitForTimeout(2200);
  const i=await page.$('[role="dialog"] input');
  await i.click(); await page.keyboard.type('QA Second',{delay:25});
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button',{hasText:/^Create$/}).first().click();
  await page.waitForTimeout(6000);
  out.requests=net;
  out.newWs=(net.find(n=>n.s<300)?.res||'').match(/"id":"(W[A-Z0-9]+)"/)?.[1]??null;
  out.list = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return (m.innerText||'').replace(/\s+/g,' ').slice(-260);},VS);
  return out;
};
