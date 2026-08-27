const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/role/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status(),req:(r.request().postData()||'').slice(0,110),res:b});}});
  const members = () => page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return ((m.innerText||'').replace(/\s+/g,' ').match(/MEMBER ROLES[^]{0,220}/)||[''])[0];},VS);
  out.membersBefore = await members();
  // assign the new role to a member
  await page.locator('button',{hasText:/^Select a member$/}).first().click().catch(()=>{});
  await page.waitForTimeout(1800);
  const pickedM = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis).find(o=>/QA Dave/.test(o.innerText||''));
    if(!o) return null; o.click(); return o.innerText.trim().slice(0,20);},VS);
  out.pickedMember=pickedM;
  await page.waitForTimeout(1500);
  await page.locator('button',{hasText:/^Select a role$/}).first().click().catch(()=>{});
  await page.waitForTimeout(1800);
  const pickedR = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis).find(o=>/V60Role/.test(o.innerText||''));
    if(!o) return null; o.click(); return o.innerText.trim().slice(0,20);},VS);
  out.pickedRole=pickedR;
  await page.waitForTimeout(1200);
  await page.locator('button',{hasText:/^Assign role$/}).first().click().catch(()=>{});
  await page.waitForTimeout(5000);
  out.membersAfterAssign = await members();
  out.assignRequests = net.slice(); net.length=0;
  // now DELETE the role
  const del = await page.evaluate((vs)=>{const vis=eval(vs);
    const rows=[...document.querySelectorAll('tr')].filter(vis);
    const r=rows.find(x=>/V60Role/.test(x.innerText||''));
    const b=r?[...r.querySelectorAll('button')].filter(vis).find(b=>/^Delete$/.test((b.innerText||'').trim())):null;
    if(!b) return null; const g=b.getBoundingClientRect(); return {x:Math.round(g.x+g.width/2),y:Math.round(g.y+g.height/2)};},VS);
  out.deleteBtn=del;
  if(del){ await page.mouse.click(del.x,del.y); await page.waitForTimeout(2200);
    const cp = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      if(!d) return null;
      const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/delete|confirm|yes/i.test(b.innerText||''));
      if(!b) return {txt:(d.innerText||'').slice(0,120)}; const g=b.getBoundingClientRect();
      return {x:Math.round(g.x+g.width/2),y:Math.round(g.y+g.height/2),dlg:(d.innerText||'').replace(/\s+/g,' ').slice(0,120)};},VS);
    out.confirm=cp;
    if(cp&&cp.x){ await page.mouse.click(cp.x,cp.y); await page.waitForTimeout(6000); } }
  out.deleteRequests=net;
  out.membersAfterDelete = await members();
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  out.membersAfterReload = await members();
  return out;
};
