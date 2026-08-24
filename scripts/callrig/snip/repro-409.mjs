export default async ({page}) => {
  const netlog=[]; const toasts=[]; const errs=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,180)); });
  // minimise call overlay so the hub is reachable
  const mini = await page.$('[data-testid="call-surface-minimize"]');
  if (mini) { await mini.click().catch(()=>{}); await page.waitForTimeout(2000); }
  const start = await page.$('[data-testid="calls-hub-start-now"]');
  if (!start) return {err:'no start-now', body: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,400))};
  await start.click(); await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name','QA-SECOND-CALL');
  const submit = await page.$('[data-testid="calls-start-submit"]');
  await submit.click();
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>({
    dialogOpen: !!document.querySelector('[data-testid="calls-start-submit"]'),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,8),
    errorText: [...document.querySelectorAll('[role="alert"],[aria-live],[class*="error" i]')].map(e=>e.innerText.trim().slice(0,120)).filter(Boolean).slice(0,8),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)
  }));
  return {net: netlog, consoleErrs: errs, after};
};
