export default async ({page}) => {
  const netlog = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const dlgs = await page.$$('[role="dialog"]');
  const modal = dlgs[dlgs.length-1];
  const radio = await modal.$('input[value="participants"]');
  if (radio) await radio.click({force:true}).catch(()=>{});
  const btns = await modal.$$('button');
  for (const b of btns) { const t = (await b.innerText()).trim(); if (/Start recording/i.test(t)) { await b.click(); break; } }
  await page.waitForTimeout(7000);
  const state = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-overlay-expanded"]');
    return {text: s? s.innerText.replace(/\n+/g,' | ').slice(0,400):'', rec: [...document.querySelectorAll('[aria-label*="ecording" i],[data-testid*="recording" i]')].map(e=>(e.getAttribute('aria-label')||e.getAttribute('data-testid'))).slice(0,10)};
  });
  return {net: netlog.filter(l=>/recording|POST|PATCH/.test(l)), state};
};
