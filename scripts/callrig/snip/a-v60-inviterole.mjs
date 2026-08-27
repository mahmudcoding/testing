const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/invit/i.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,180);}catch(e){}
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,46),s:r.status(),req:(r.request().postData()||'').slice(0,140),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4800);
  // open the Role selector
  const rb = page.locator('button',{hasText:/^Role$/}).first();
  out.roleBtnFound = await rb.count()>0;
  if(out.roleBtnFound){ await rb.click(); await page.waitForTimeout(1800);
    out.roleOptions = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...new Set([...document.querySelectorAll('[role="option"],[role="menuitem"],[role="listbox"] *')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean))].slice(0,12);},VS);
    await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(700); }
  // create an invite link
  await page.locator('button',{hasText:/^Create invite link$/}).first().click().catch(e=>out.createErr=String(e).slice(0,40));
  await page.waitForTimeout(5000);
  out.requests=net;
  out.afterCreate = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,420),
      rows:[...m.querySelectorAll('tr')].filter(vis).slice(0,6).map(r=>[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,26))) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/invite-created.png'});
  return out;
};
