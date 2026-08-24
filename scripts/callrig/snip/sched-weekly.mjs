export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('calendar')){let b='';try{b=(await r.text()).slice(0,600);}catch(e){} if(r.request().method()!=='GET') net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.locator('[role="listbox"] >> text=Every week').first().click();
  await page.waitForTimeout(1500);
  const st = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const b=[...d.querySelectorAll('button')].find(x=>/Custom RRULE/.test(x.textContent));
    return {rrule: b? {ariaDisabled:b.getAttribute('aria-disabled'), cursor:getComputedStyle(b).cursor}:null,
            repeatValue: [...d.querySelectorAll('span')].map(s=>s.textContent.trim()).filter(t=>/repeat|Every/.test(t)).slice(0,3),
            summary: d.innerText.replace(/\n+/g,' | ').slice(-200)};
  });
  await page.fill('[role="dialog"] input[aria-label="Add title"]', 'QA Weekly Sync');
  // add Bob + Carol as participants
  for (const n of ['QA Bob','QA Carol']) {
    const b = page.locator('[role="dialog"] button', {hasText: new RegExp('^'+n+'$')}).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(500); }
  }
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button', {hasText:/^Schedule meeting$/}).first().click();
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>({
    dialogOpen: !!document.querySelector('[role="dialog"]'),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)).filter(Boolean),
    hub: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400)}));
  return {st, net, after};
};
