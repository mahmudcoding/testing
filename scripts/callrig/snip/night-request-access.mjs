export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('breakout')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  const p = await page.$('[data-testid="breakout-rooms-panel"]');
  const btns = await p.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/request access/i.test(l)){ await b.click(); clicked=l; break; } }
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="breakout-rooms-panel"]');
    return {panel:p?p.innerText.replace(/\n+/g,' | ').slice(0,300):null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean)};
  });
  return {clicked, net, after};
};
