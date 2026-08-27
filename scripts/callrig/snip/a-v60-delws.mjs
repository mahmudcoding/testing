const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/workspace/i.test(u)&&['DELETE','POST'].includes(r.request().method())){
    let b=null;try{b=(await r.text()).slice(0,140);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,46),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/workspaces',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.rows = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('tr')].filter(vis).map(r=>({txt:(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,50),
      btns:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,22))})).slice(0,6);},VS);
  // find a delete/remove action on the QA Second row
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('tr')].filter(vis);
    const r=rows.find(x=>/QA Second/.test(x.innerText||''));
    if(!r) return {noRow:true};
    const b=[...r.querySelectorAll('button')].filter(vis).find(b=>/delete|remove|archive/i.test((b.getAttribute('aria-label')||b.innerText||'')));
    if(!b) return {noBtn:true, avail:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,20))};
    const g=b.getBoundingClientRect(); return {x:Math.round(g.x+g.width/2),y:Math.round(g.y+g.height/2),label:(b.getAttribute('aria-label')||b.innerText||'').trim()};},VS);
  out.target=pos;
  if(pos && pos.x){ await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(2500);
    out.confirm = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,180):null;},VS); }
  out.requests=net;
  return out;
};
