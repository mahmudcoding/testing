export default async ({page}) => {
  const who = process.env.QA_WHO;
  const item = process.env.QA_ITEM;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  // close any stray modal first
  const dlgs = await page.$$('[role="dialog"]');
  for (const d of dlgs) { const tid=await d.getAttribute('data-testid'); if (tid && tid!=='call-overlay-expanded') {} }
  const trigs = await page.$$('[data-testid="participant-tile-card-trigger"]');
  let opened=null;
  for (const b of trigs) { const l=await b.getAttribute('aria-label'); if (l && l.includes(who)) { await b.click(); opened=l; break; } }
  if (!opened) return {err:'trigger not found for '+who};
  await page.waitForTimeout(1800);
  const el = page.locator('[data-testid="'+item+'"]');
  if (!await el.count()) return {opened, err:'item not found: '+item};
  const label = await el.getAttribute('aria-label') || await el.innerText();
  if (!label.includes(who.split(' ').pop())) return {opened, abort:'label mismatch: '+label};
  await el.click();
  await page.waitForTimeout(3500);
  const toasts = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean));
  return {opened, clicked: label, net, toasts};
};
