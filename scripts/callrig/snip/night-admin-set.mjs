export default async ({page}) => {
  const check=(process.env.QA_CHECK||'').split(',').filter(Boolean);
  const uncheck=(process.env.QA_UNCHECK||'').split(',').filter(Boolean);
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  for (const k of check) await page.locator('[data-testid="admin-permission-'+k+'"]').check();
  for (const k of uncheck) await page.locator('[data-testid="admin-permission-'+k+'"]').uncheck();
  await page.waitForTimeout(600);
  const boxes={};
  for (const k of ['can_pin_video','can_manage_chat','can_manage_meeting_settings']) boxes[k]=await page.locator('[data-testid="admin-permission-'+k+'"]').isChecked();
  const s=page.locator('[data-testid="admin-permissions-submit"]');
  const dis=await s.isDisabled();
  if(!dis){ await s.click(); await page.waitForTimeout(4000); }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {boxesBeforeSave: boxes, submitDisabled: dis, net, toasts};
};
