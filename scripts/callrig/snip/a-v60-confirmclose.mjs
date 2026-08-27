const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,110);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,52),s:r.status(),res:b});}});
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Close room$/.test((b.innerText||'').trim()));
    if(!b) return {noBtn:true, btns:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').trim())};
    const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.pos=pos;
  if(!pos||pos.noBtn) return out;
  await page.mouse.click(pos.x,pos.y);
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/V60/.test(t)),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22)).filter(t=>/leave|close|end/i.test(t)),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean) };},VS);
  const poll=[]; for(let i=0;i<12;i++){ poll.push({t:i*700,...(await read())}); await page.waitForTimeout(700); }
  out.after=poll[poll.length-1]; out.anyToast=poll.find(p=>p.toasts.length)?.toasts??null; out.requests=net;
  return out;
};
