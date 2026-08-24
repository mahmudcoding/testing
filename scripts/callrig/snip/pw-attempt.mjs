export default async ({page}) => {
  const pw = process.env.QA_TRYPW;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/join')){let b='';try{b=(await r.text()).slice(0,260);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.fill('[data-testid="call-password-input"]', pw);
  await page.waitForTimeout(400);
  await page.locator('button', {hasText:'Join call'}).first().click();
  await page.waitForTimeout(4500);
  const st = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    const inp=document.querySelector('[data-testid="call-password-input"]');
    return {gateStillUp: !!inp,
      ariaInvalid: inp? inp.getAttribute('aria-invalid'):null,
      msg: (()=>{ if(!inp) return null; const id=inp.getAttribute('aria-describedby'); const e=id&&document.getElementById(id); return e?e.textContent.trim().slice(0,140):null; })(),
      dialogText: dlg? dlg.innerText.replace(/\n+/g,' | ').slice(0,400):null,
      toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean),
      body: document.body.innerText.replace(/\n+/g,' | ').slice(0,350)};
  });
  return {net, st};
};
