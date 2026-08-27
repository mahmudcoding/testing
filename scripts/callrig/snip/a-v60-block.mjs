const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/block|call|meeting/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,180);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),res:b});}});
  // block bob via the API-backed UI path: Privacy & security -> blocked users, or profile menu
  out.blockReq = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({user_id:'U4QABOB00000001'})});
    return {status:r.status, body:(await r.text()).slice(0,120)};});
  await page.waitForTimeout(2500);
  // now try to start a 1:1 call with bob from the directory
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const el=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^QA Bob$/.test((e.innerText||'').trim()))[0];
    if(!el) return null; const row=el.closest('div')?.parentElement;
    const b=row?[...row.querySelectorAll('button')].filter(vis).find(b=>/^Call$/.test((b.innerText||'').trim())):null;
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.callBtn=pos;
  if(pos){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(7000); }
  out.result = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,40),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)).filter(Boolean),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,140)),
      errText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/block|cannot|unable|not allowed/i.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,60)).slice(0,4) };},VS);
  out.requests=net;
  return out;
};
