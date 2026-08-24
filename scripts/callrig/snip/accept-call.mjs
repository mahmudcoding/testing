export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const b = await page.$('button:has-text("Accept")');
  if (!b) return {err:'no Accept'};
  await b.click();
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>({url:location.href, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,350)}));
  return {net: netlog, after};
};
