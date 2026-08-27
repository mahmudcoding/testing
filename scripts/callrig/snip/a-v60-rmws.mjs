const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,60),s:r.status(),res:b});}});
  out.allRemove = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/^Remove /.test(a||''));},VS);
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button[aria-label]')].filter(vis).find(b=>/^Remove QA Dave from this workspace/i.test(b.getAttribute('aria-label')||''));
    if(!b) return null; const r=b.getBoundingClientRect(); return {al:b.getAttribute('aria-label'),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.target=pos;
  if(!pos) return out;
  await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(2200);
  out.confirm = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,220),btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,20))}:null;},VS);
  if(out.confirm){
    const cp = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Remove/i.test((b.innerText||'').trim()));
      if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
    if(cp){ await page.mouse.click(cp.x,cp.y); await page.waitForTimeout(4500); }
  }
  out.requests=net;
  return out;
};
