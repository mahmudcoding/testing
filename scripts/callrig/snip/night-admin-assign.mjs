export default async ({page}) => {
  const keys = (process.env.QA_KEYS||'can_manage_chat').split(',');
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  for (const k of keys) { await page.locator('[data-testid="admin-permission-'+k+'"]').check(); await page.waitForTimeout(400); }
  const submit = page.locator('[data-testid="admin-permissions-submit"]');
  const before = {label: (await submit.innerText()).trim(), disabled: await submit.isDisabled()};
  if (before.disabled) return {before, err:'submit disabled'};
  await submit.click();
  await page.waitForTimeout(4000);
  const toasts = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {checked: keys, before, net, toasts};
};
