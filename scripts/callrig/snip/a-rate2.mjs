const sect = () => {
  const s = document.querySelector('[data-testid="ended-rate-section"]');
  if (!s) return {absent:true, bodyHas: document.body.innerText.includes('RATE QUALITY')};
  return {text: s.innerText.replace(/\n+/g,' | ').slice(0,200),
          filled: [...s.querySelectorAll('button')].map(b=>(b.querySelector('svg')?.getAttribute('fill')||'?')).join(','),
          labels: [...s.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).join(' / ')};
};
export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/rating/.test(u)){let b='';try{b=(await r.text()).slice(0,160);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: req=${(r.request().postData()||'').slice(0,80)} :: ${b}`);} });
  const out = {start: await page.evaluate(sect)};
  // change the rating: click 2 stars
  const b2 = page.locator('[data-testid="ended-rate-section"] button[aria-label="2 stars"]');
  if (await b2.count()) { await b2.click(); await page.waitForTimeout(2500); }
  out.afterChangeTo2 = await page.evaluate(sect);
  out.apiAfterChange = await page.evaluate(async (id) => (await (await fetch('/api/v1/meeting/'+id,{credentials:'include'})).json()).meeting?.rating, process.env.QA_MEET);
  // reload the ended page
  out.urlBefore = page.url();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(sect);
  out.urlAfter = page.url();
  out.bodyAfterReload = await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,500));
  out.net = net;
  return out;
};
