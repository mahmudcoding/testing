export default async ({page}) => {
  const keys=(process.env.QA_KEYS||'can_manage_meeting_settings').split(',');
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const before={};
  for (const k of ['can_pin_video','can_manage_meeting_settings']) before[k]=await page.locator('[data-testid="admin-permission-'+k+'"]').isChecked();
  for (const k of keys) await page.locator('[data-testid="admin-permission-'+k+'"]').uncheck();
  await page.waitForTimeout(600);
  const s=page.locator('[data-testid="admin-permissions-submit"]');
  const sub={l:(await s.innerText()).trim(), dis: await s.isDisabled()};
  if (!sub.dis) { await s.click(); await page.waitForTimeout(4000); }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {before, unchecked:keys, submit:sub, net, toasts};
};
