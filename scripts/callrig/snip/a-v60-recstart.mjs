const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    const b=d?[...d.querySelectorAll('button')].filter(vis).find(b=>/^Start recording$/i.test((b.innerText||'').trim())):null;
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.startBtn=pos;
  if(pos){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(6000); }
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { recBtns:[...document.querySelectorAll('button[aria-label]')].filter(vis).map(b=>b.getAttribute('aria-label')).filter(a=>/record/i.test(a||'')).slice(0,4),
      recNotices:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/record/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,54)).slice(0,6),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean) };},VS);
  return out;
};
