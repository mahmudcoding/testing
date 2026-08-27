export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('record')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t=page.locator('[data-testid="recording-start-access-trigger"]');
  if(!await t.count()) return {err:'no record button'};
  await t.click();
  await page.waitForTimeout(2500);
  const dlg = await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,400), controls:[...m.querySelectorAll('button,input,[role="radio"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),t:e.getAttribute('data-testid'),checked:e.getAttribute('aria-checked')}))}:null;
  });
  return {dialog: dlg, net};
};
