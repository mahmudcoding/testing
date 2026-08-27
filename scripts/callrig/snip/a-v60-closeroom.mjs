const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,52),s:r.status(),res:b});}});
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/V60/.test(t)).slice(0,4),
      toolbar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22)).filter(t=>/leave|close|end/i.test(t)),
      videos:[...document.querySelectorAll('video')].map(v=>Math.round(v.getBoundingClientRect().width)),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean) };},VS);
  out.before = await read();
  const cr = page.locator('button', { hasText: /^Close room$/ }).first();
  out.found = await cr.count()>0;
  if(!out.found) return out;
  await cr.click(); await page.waitForTimeout(2200);
  out.confirm = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,160),btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,20))}:null;},VS);
  if(out.confirm){ await page.locator('[role="dialog"] button, [role="alertdialog"] button',{hasText:/close|confirm|yes/i}).first().click().catch(()=>{}); }
  const poll=[]; for(let i=0;i<12;i++){ poll.push({t:i*700,...(await read())}); await page.waitForTimeout(700); }
  out.after = poll[poll.length-1];
  out.anyToast = poll.find(p=>p.toasts.length)?.toasts ?? null;
  out.requests = net;
  return out;
};
