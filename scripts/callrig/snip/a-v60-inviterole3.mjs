const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/invit/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,150);}catch(e){}
    net.push({req:(r.request().postData()||'').slice(0,120),s:r.status(),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('button',{hasText:/^Select a role$/}).first().click();
  await page.waitForTimeout(1800);
  // pick a REAL role this time
  out.picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const o=[...document.querySelectorAll('[role="option"],[role="menuitem"]')].filter(vis)
      .find(o=>/Workspace role|Company role/.test(o.innerText||''));
    if(!o) return null; const t=o.innerText.trim().slice(0,32); o.click(); return t;},VS);
  await page.waitForTimeout(1500);
  await page.locator('button',{hasText:/^Create invite link$/}).first().click().catch(e=>out.err=String(e).slice(0,40));
  await page.waitForTimeout(6000);
  out.requests=net;
  out.rows = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return [...m.querySelectorAll('tr')].filter(vis).map(r=>[...r.querySelectorAll('td,th')]
      .map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))).filter(r=>r.length>2).slice(0,6);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/invite-roles2.png'});
  return out;
};
