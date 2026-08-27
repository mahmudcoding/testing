const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/invit/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,200);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,48),s:r.status(),req:(r.request().postData()||'').slice(0,150),res:b});}});
  await page.locator('button',{hasText:/^Select a role$/}).first().click();
  await page.waitForTimeout(2000);
  out.options = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"],[role="listbox"] li,[role="listbox"] div')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<60))].slice(0,12);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/invite-roles.png'});
  // pick the first real role and create the link
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)[0];
    if(!o) return null; const txt=o.innerText.trim().slice(0,30); o.click(); return txt;},VS);
  out.picked=picked;
  await page.waitForTimeout(1500);
  await page.locator('button',{hasText:/^Create invite link$/}).first().click().catch(e=>out.err=String(e).slice(0,40));
  await page.waitForTimeout(5000);
  out.requests=net;
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return { linksSection:(t.match(/Invite links[^]{0,220}/)||[''])[0] };},VS);
  return out;
};
