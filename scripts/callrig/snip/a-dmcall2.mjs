export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/meeting/.test(u) && r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,240);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/d/C4OS3QRHTP93TJV', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const b = page.locator('button[aria-label="Start call"]').first();
  if (!(await b.count())) return {err:'no Start call button'};
  const t0 = new Date().toISOString();
  await b.click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>({url:location.href, body:document.body.innerText.replace(/\n+/g,' | ').slice(-450)}));
  return {t0, after, net};
};
