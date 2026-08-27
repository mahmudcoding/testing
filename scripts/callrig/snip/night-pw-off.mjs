export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const s=page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const tg=page.locator('[data-testid="meeting-settings-password-toggle"]');
  const before=await tg.getAttribute('aria-checked');
  const disabled=await tg.isDisabled();
  await tg.click();
  await page.waitForTimeout(1200);
  const afterClick=await tg.getAttribute('aria-checked');
  const save=page.locator('[data-testid="meeting-settings-save"]');
  const sdis=await save.isDisabled();
  if(!sdis){ await save.click(); await page.waitForTimeout(4000); }
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean));
  const hint=await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    const m=p?p.innerText.match(/.{0,80}cannot be turned off.{0,80}/i):null; return m?m[0]:null;
  });
  return {toggleWasDisabled:disabled, before, afterClick, saveDisabled:sdis, toasts, lockedHintShown:hint, net};
};
