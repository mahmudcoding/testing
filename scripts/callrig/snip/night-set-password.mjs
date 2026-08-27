export default async ({page}) => {
  const pw=process.env.QA_PW||'NightPass1';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const s=page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const tg=page.locator('[data-testid="meeting-settings-password-toggle"]');
  if (await tg.getAttribute('aria-checked')!=='true'){ await tg.click(); await page.waitForTimeout(1200); }
  const inp=page.locator('[data-testid="meeting-settings-password-input"]');
  await inp.fill(pw);
  await page.waitForTimeout(700);
  const save=page.locator('[data-testid="meeting-settings-save"]');
  const dis=await save.isDisabled();
  if(!dis){ await save.click(); await page.waitForTimeout(4000); }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean));
  return {saveDisabled:dis, net, toasts};
};
