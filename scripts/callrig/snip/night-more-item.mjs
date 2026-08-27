export default async ({page}) => {
  const tid=process.env.QA_ITEM;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const tb=await page.$('[data-testid="call-toolbar"]');
  const btns=await tb.$$('button');
  let opened=false;
  for (const b of btns){ const l=await b.getAttribute('aria-label')||''; if(/^More$/i.test(l)){ await b.click(); opened=true; await page.waitForTimeout(1800); break; } }
  if(!opened) return {err:'no More button'};
  const el=page.locator('[data-testid="'+tid+'"]');
  if(!await el.count()) return {err:'item not found: '+tid};
  const label=(await el.innerText()).trim();
  await el.click();
  await page.waitForTimeout(3500);
  const dlg=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{testid:m.getAttribute('data-testid'), text:m.innerText.replace(/\n+/g,' | ').slice(0,600),
      controls:[...m.querySelectorAll('button,input,[role="radio"],[role="option"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),t:e.getAttribute('data-testid'),d:e.disabled}))}:null;
  });
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean));
  return {clicked: label, dialog: dlg, toasts, net};
};
