const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,50),s:r.status(),req:(r.request().postData()||'').slice(0,180),res:b});}});
  const name='V60 Room A';
  const ti=await page.$('input[placeholder="e.g. Design sync"]');
  await ti.click(); await page.keyboard.type(name,{delay:25});
  await page.waitForTimeout(500);
  // invite Bob
  await page.locator('button', { hasText: /QA Bob/ }).first().click().catch(e=>out.pickErr=String(e).slice(0,60));
  await page.waitForTimeout(900);
  await page.locator('button', { hasText: /^Create room$/ }).first().click();
  await page.waitForTimeout(5000);
  out.name=name; out.requests=net;
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/sideroom-created.png'});
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,360),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,16) };},VS);
  return out;
};
