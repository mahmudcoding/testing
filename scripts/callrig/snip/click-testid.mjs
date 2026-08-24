export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&(u.includes('breakout')||u.includes('meeting'))){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const sel = process.env.QA_SEL;
  const el = await page.$(sel);
  if (!el) return {err:'missing '+sel};
  await el.click({timeout:8000});
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  const after = await page.evaluate(()=>{const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body; return s.innerText.replace(/\n+/g,' | ').slice(0,700);});
  return {after, net: netlog.filter(l=>/POST|PATCH|DELETE|[45]\d\d/.test(l))};
};
