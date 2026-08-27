export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('deny')||u.includes('admit')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t=page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  const panel=await page.$('[data-testid="participants-list-panel"]');
  const btns=await panel.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Deny/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Deny', panelText: await panel.evaluate(e=>e.innerText.replace(/\n+/g,' | ').slice(0,300))};
  await page.waitForTimeout(4000);
  return {clicked, net, panelAfter: await page.evaluate(()=>{const p=document.querySelector('[data-testid="participants-list-panel"]');return p?p.innerText.replace(/\n+/g,' | ').slice(0,250):null;})};
};
