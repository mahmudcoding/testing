export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('react')||u.includes('/messages')){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  const trig=page.locator('[data-testid="ic-message-react-trigger"]').last();
  if(!await trig.count()) return {err:'no react trigger'};
  await trig.click();
  await page.waitForTimeout(1800);
  const picker=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,200), buttons:[...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,10))}:null;
  });
  return {pickerOpened: picker, net};
};
