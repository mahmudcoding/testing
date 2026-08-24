export default async ({page}) => {
  const M = process.env.QA_MEET, who = process.env.QA_WHO;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('invite')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.click('[data-testid="call-controls-add-to-call"]');
  await page.waitForTimeout(2000);
  const rows = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return [...dlg.querySelectorAll('input[type=checkbox]')].map(c=>({n:c.getAttribute('aria-label'), d:c.disabled}));
  });
  const cb = page.locator(`[role="dialog"] input[type=checkbox][aria-label="${who}"]`);
  if (!(await cb.count())) return {err:'no checkbox for '+who, rows};
  const dis = await cb.isDisabled();
  if (dis) return {rows, blockedInUi: true};
  await cb.check();
  await page.waitForTimeout(500);
  await page.locator('[role="dialog"] button', {hasText:/^Invite \(/}).first().click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(() => ({
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)).filter(Boolean)
  }));
  // direct API probe too
  const api = await page.evaluate(async (a) => {
    const r = await fetch('/api/v1/meeting/'+a.M+'/invite',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_ids:[a.uid]})});
    return r.status+' :: '+(await r.text()).slice(0,200);
  }, {M, uid: process.env.QA_UID});
  return {rows, net, after, apiDirect: api};
};
