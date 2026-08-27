const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/invit/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,180);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,46),s:r.status(),req:(r.request().postData()||'').slice(0,140),res:b});}});
  // locate the selectable control on the QA Outsider row
  out.row = await page.evaluate((vs)=>{const vis=eval(vs);
    const lbl=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^QA Outsider$/.test((e.innerText||'').trim()))[0];
    if(!lbl) return null;
    let n=lbl, row=null;
    for(let i=0;i<5&&n;i++){ n=n.parentElement; if(n&&(n.querySelector('input[type=checkbox]')||n.getAttribute('role')==='option')){ row=n; break; } }
    if(!row) return {noRow:true, tag:lbl.tagName, parentHTML:(lbl.parentElement?.outerHTML||'').slice(0,200)};
    const cb=row.querySelector('input[type=checkbox]');
    const r=(cb||row).getBoundingClientRect();
    return { hasCheckbox:!!cb, x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2) };},VS);
  if(out.row && out.row.x){ await page.mouse.click(out.row.x,out.row.y); await page.waitForTimeout(2000); }
  out.sendState = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis).find(b=>/Send direct invites/i.test(b.innerText||''));
    return b?{disabled:b.disabled}:null;},VS);
  if(out.sendState && !out.sendState.disabled){
    await page.locator('button',{hasText:/Send direct invites/}).first().click().catch(()=>{});
    await page.waitForTimeout(6000);
  }
  out.requests=net;
  out.toasts = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(x=>(x.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean);},VS);
  return out;
};
