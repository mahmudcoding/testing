export default async ({page}) => {
  const tid=process.env.QA_TID; const M=process.env.QA_MEET;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/settings')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const s=page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.count() && await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const el=page.locator('[data-testid="'+tid+'"]');
  if(!await el.count()) return {err:'no '+tid};
  const before=await el.getAttribute('aria-checked');
  await el.click(); await page.waitForTimeout(3000);
  const after=await el.getAttribute('aria-checked');
  return {tid, before, after, net};
};
