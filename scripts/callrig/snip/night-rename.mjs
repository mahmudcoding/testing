export default async ({page}) => {
  const newName=process.env.QA_NEWNAME||'QA RENAMED NIGHT';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const s=page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const inp=page.locator('[data-testid="meeting-settings-name-input"]');
  const before=await inp.inputValue();
  await inp.fill(newName);
  await page.waitForTimeout(700);
  const save=page.locator('[data-testid="meeting-settings-save"]');
  const dis=await save.isDisabled();
  if(!dis){ await save.click(); await page.waitForTimeout(4000); }
  const after=await inp.inputValue();
  const top=await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-top-bar"]');return t?t.innerText.replace(/\n+/g,' | ').slice(0,120):null;});
  return {before, typed:newName, saveDisabled:dis, after, ownTopBar: top, net};
};
