export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,240);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.click('[data-testid="call-controls-end-for-everyone"]');
  await page.waitForTimeout(1500);
  const dlg = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="alertdialog"],[role="dialog"]')].pop();
    return {text: d? d.innerText.replace(/\n+/g,' | ').slice(0,400):null,
            buttons: d? [...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36)}#${b.getAttribute('data-testid')||'-'}`):[]};
  });
  const confirm = page.locator('[data-testid="call-end-confirm-submit"]');
  let did=false;
  if (await confirm.count()) { await confirm.click(); did=true; }
  else { const b = page.locator('[role="alertdialog"] button, [role="dialog"] button', {hasText:/End call|End for everyone|End/}).last(); if (await b.count()) { await b.click(); did=true; } }
  const t = new Date().toISOString();
  await page.waitForTimeout(4000);
  return {dlg, confirmed: did, endedAt: t, net, after: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,300))};
};
