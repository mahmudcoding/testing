const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status(),res:b});}});
  const b = page.locator('button[aria-label="Stop main-room recording"], button[aria-label="Stop recording"]').first();
  out.found = await b.count()>0;
  if(out.found){ await b.click(); await page.waitForTimeout(3000);
    // may confirm
    const pos = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      if(!d) return null;
      const x=[...d.querySelectorAll('button')].filter(vis).find(x=>/stop|confirm|yes/i.test(x.innerText||''));
      if(!x) return {dlg:(d.innerText||'').slice(0,120)}; const r=x.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),dlg:(d.innerText||'').replace(/\s+/g,' ').slice(0,140)};},VS);
    out.confirm=pos;
    if(pos&&pos.x){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(6000); }
  }
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { recAria:[...document.querySelectorAll('[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/record/i.test(a||'')).slice(0,4),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean) };},VS);
  return out;
};
