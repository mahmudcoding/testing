const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,52),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('button[aria-label="Side Rooms"]').first().click().catch(e=>out.e1=String(e).slice(0,40));
  await page.waitForTimeout(2500);
  await page.locator('button',{hasText:/^New Side Room$/}).first().click().catch(e=>out.e2=String(e).slice(0,40));
  await page.waitForTimeout(2500);
  out.form = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
      pickable:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(t=>/Guest|QA /.test(t)) };},VS);
  const ti=await page.$('input[placeholder="e.g. Design sync"]');
  if(ti){ await ti.click(); await page.keyboard.type('Room G',{delay:25}); }
  await page.waitForTimeout(600);
  // invite the guest with a real mouse click
  const g = page.locator('[role="dialog"] button, aside button',{hasText:/V60 Guest/}).first();
  out.guestPickable = await g.count()>0;
  if(out.guestPickable){ await g.click().catch(e=>out.e3=String(e).slice(0,40)); await page.waitForTimeout(900); }
  await page.locator('button',{hasText:/^Create room$/}).first().click();
  await page.waitForTimeout(6000);
  out.requests=net;
  out.roomId=(net.find(n=>/breakout-rooms$/.test(n.u||''))?.res||'').match(/"id":"([^"]+)"/)?.[1]??null;
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return (d.innerText||'').replace(/\s+/g,' ').slice(0,260);},VS);
  return out;
};
