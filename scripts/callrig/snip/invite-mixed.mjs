export default async ({page}) => {
  const M = process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('invite')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  // reopen dialog
  const open = await page.$('[role="dialog"] [data-testid="add-to-call-members"]');
  if (!open) { await page.click('[data-testid="call-controls-add-to-call"]'); await page.waitForTimeout(2000); }
  for (const n of ['QA Bob','QA Carol']) {
    const cb = page.locator(`[role="dialog"] input[type=checkbox][aria-label="${n}"]`);
    if (await cb.count() && !(await cb.isChecked())) await cb.check();
  }
  await page.waitForTimeout(600);
  const sel = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {checked: [...dlg.querySelectorAll('input[type=checkbox]')].filter(c=>c.checked).map(c=>c.getAttribute('aria-label')),
            btn: [...dlg.querySelectorAll('button')].find(b=>/Invite \(/.test(b.textContent))?.textContent.trim()};
  });
  await page.locator('[role="dialog"] button', {hasText:/^Invite \(/}).first().click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(async (M) => {
    const parts = await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json();
    return {toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,160)).filter(Boolean),
            participants: (parts.participants||[]).map(p=>p.name)};
  }, M);
  return {sel, net, after};
};
