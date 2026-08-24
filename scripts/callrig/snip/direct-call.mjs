export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const dlg = (await page.$$('[role="dialog"]')).pop();
  let clicked=false;
  if (dlg) { const bs = await dlg.$$('button'); for (const b of bs) { if ((await b.innerText()).trim()==='Call') { await b.click(); clicked=true; break; } } }
  await page.waitForTimeout(8000);
  const after = await page.evaluate(()=>({
    url: location.href,
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d=>`${d.getAttribute('data-testid')||'-'} :: ${d.innerText.replace(/\n+/g,' | ').slice(0,300)}`),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)
  }));
  return {clicked, net: netlog, after};
};
