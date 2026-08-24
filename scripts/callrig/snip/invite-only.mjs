export default async ({page}) => {
  const M = process.env.QA_MEET, who = (process.env.QA_WHO||'').split(',');
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('invite')){let b='';try{b=(await r.text()).slice(0,240);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const open = await page.$('[role="dialog"] [data-testid="add-to-call-members"]');
  if (!open) { await page.click('[data-testid="call-controls-add-to-call"]'); await page.waitForTimeout(2000); }
  // clear all
  await page.evaluate(() => { [...document.querySelectorAll('[role="dialog"] input[type=checkbox]')].forEach(c=>{ if(c.checked) c.click(); }); });
  await page.waitForTimeout(800);
  for (const n of who) { const cb = page.locator(`[role="dialog"] input[type=checkbox][aria-label="${n}"]`); if (await cb.count() && !(await cb.isChecked())) await cb.check(); }
  await page.waitForTimeout(600);
  const sel = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] input[type=checkbox]')].filter(c=>c.checked).map(c=>c.getAttribute('aria-label')));
  await page.locator('[role="dialog"] button', {hasText:/^Invite \(/}).first().click();
  await page.waitForTimeout(3500);
  const toasts = await page.evaluate(() => [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)).filter(Boolean));
  return {sel, net, toasts};
};
