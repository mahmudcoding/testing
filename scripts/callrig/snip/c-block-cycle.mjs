export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const vis = `(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  // A) blocker tries to message the blocked user
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('[role=dialog] button', {hasText:/^Message$/}).first().click();
  await page.waitForTimeout(3000);
  const blockerSide = await page.evaluate(v => {
    const vv = eval(v);
    return {url:location.pathname, composer:!!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vv).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean)};
  }, vis);
  // B) unblock from Settings -> Privacy
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/privacy`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const ub = page.locator('button', {hasText:'Unblock QA Bob'}).first();
  const hadUnblock = await ub.count()>0;
  if(hadUnblock){ await ub.click(); await page.waitForTimeout(2500); }
  const after = await page.evaluate(async v => {
    const vv = eval(v);
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const j=await r.json();
    const m=document.querySelector('main')||document.body;
    return {blocked:j, stillHasUnblockBtn: [...m.querySelectorAll('button')].filter(vv).some(b=>/Unblock/.test(b.innerText||'')),
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vv).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean)};
  }, vis);
  return {blockerSide, hadUnblock, afterUnblock: after};
};
