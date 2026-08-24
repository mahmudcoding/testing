export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const open = process.env.QA_OPEN; const item = process.env.QA_ITEM;
  if (open) { const o = await page.$(open); if(!o) return {err:'no trigger '+open}; await o.click(); await page.waitForTimeout(1500); }
  let pops = await page.$$('[role="menu"],[data-radix-popper-content-wrapper]');
  if (!pops.length && open) { const o = await page.$(open); if(o){ await o.click(); await page.waitForTimeout(1800); } pops = await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'); }
  const pop = pops[pops.length-1];
  if (!pop) return {err:'no menu'};
  const items = await pop.$$('button,[role="menuitem"]');
  for (const it of items) { const t=(await it.innerText()).trim(); if (t===item) { await it.click(); await page.waitForTimeout(4000); return {clicked:t, net: netlog}; } }
  return {err:'no item '+item, have: await Promise.all(items.map(async i=>(await i.innerText()).trim()))};
};
