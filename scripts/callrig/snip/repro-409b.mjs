export default async ({page}) => {
  const netlog=[]; const errs=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,180)); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const start = await page.$('[data-testid="calls-hub-start-now"]');
  if (!start) return {err:'no start-now'};
  await start.click(); await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name','QA-SECOND-CALL-B');
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>({
    dialogOpen: !!document.querySelector('[data-testid="calls-start-submit"]'),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,8),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,260)
  }));
  return {net: netlog, consoleErrs: errs, after};
};
