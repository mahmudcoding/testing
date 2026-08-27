export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/privacy`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const sect = await page.evaluate(() => {
    const b=[...document.querySelectorAll('button[aria-label^="Unblock"]')][0];
    if(!b) return {noBtn:true};
    let n=b; for(let i=0;i<5&&n.parentElement;i++) n=n.parentElement;
    return {label:b.getAttribute('aria-label'), around:n.innerText.replace(/\s+/g,' ').slice(0,300)};
  });
  await page.locator('button[aria-label^="Unblock"]').first().click();
  await page.waitForTimeout(3000);
  const after = await page.evaluate(async () => {
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    return {api: await r.json(), stillBtn: document.querySelectorAll('button[aria-label^="Unblock"]').length};
  });
  // now re-open Bob's card
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  await page.locator('main').getByText('QA Bob',{exact:true}).first().click();
  await page.waitForTimeout(2200);
  const card = await page.evaluate(() => {
    const d=document.querySelector('[role=dialog]');
    return d?{text:d.innerText.replace(/\s+/g,' ').slice(0,200), block:[...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,20),dis:b.disabled})).filter(x=>/Block/i.test(x.l))}:{noDialog:true};
  });
  return {blockedSection: sect, afterUnblock: after, bobCardAfterUnblock: card};
};
