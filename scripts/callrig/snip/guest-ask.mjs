export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} if(/guest|join/.test(u)) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.fill('input[type=text]', process.env.QA_GUESTNAME||'QA Lobby Guest');
  await page.waitForTimeout(400);
  const b = await page.$('button:has-text("Ask to join")');
  if (!b) return {err:'no ask button'};
  await b.click();
  await page.waitForTimeout(9000);
  const body = await page.evaluate(()=>({url:location.href, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,450)}));
  return {body, net: netlog};
};
