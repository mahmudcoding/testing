const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,110);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,54),s:r.status()});}});
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  // make sure the Side Rooms panel is open so "Close room" is the room's control
  const cr = page.locator('button',{hasText:/^Close room$/}).first();
  if(!(await cr.count())){
    await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{});
    await page.waitForTimeout(2500);
  }
  out.closeFound = await page.locator('button',{hasText:/^Close room$/}).first().count()>0;
  if(!out.closeFound) return out;
  await page.locator('button',{hasText:/^Close room$/}).first().click();
  await page.waitForTimeout(2200);
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Close room$/.test((b.innerText||'').trim()));
    if(!b) return {noBtn:true,txt:(d.innerText||'').slice(0,120)};
    const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),dlg:(d.innerText||'').replace(/\s+/g,' ').slice(0,150)};},VS);
  out.confirm=pos;
  if(pos&&pos.x){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(6000); }
  out.requests=net;
  return out;
};
