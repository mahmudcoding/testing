// Verifies the report's claim: unblocking is only possible in Settings -> Privacy & security.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const V=`(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/privacy`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(v=>{const vv=eval(v);
    const main=document.querySelector('main')||document.body;
    return {text:(main.innerText||'').replace(/\s+/g,' ').slice(0,420),
      btns:[...main.querySelectorAll('button,a[href],[role=button]')].filter(vv).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean)};
  }, V);
  const ub = page.locator('main button', {hasText:/Unblock/i}).first();
  const found = await ub.count();
  if(found) { await ub.click(); await page.waitForTimeout(2500); }
  const after = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    return {api:{s:r.status,b:(await r.text()).slice(0,200)}, text:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
  return {privacyPageBefore:before, clickedUnblock:!!found, after};
};
