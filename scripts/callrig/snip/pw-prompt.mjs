export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} if(r.request().method()!=='GET'||r.status()>=400) net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const btns = await page.$$('button');
  let clicked=null;
  for (const b of btns) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Join$/i.test(t)) { await b.click(); clicked=t; break; } }
  if(!clicked) return {err:'no Join', body: await page.evaluate(()=>document.body.innerText.slice(0,400))};
  await page.waitForTimeout(4000);
  return {net, state: await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {dialog: dlg? dlg.innerText.replace(/\n+/g,' | ').slice(0,500):null,
      inputs: [...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}`).slice(0,10),
      testids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].filter(t=>/pass|join|lobby|gate/i.test(t)),
      body: document.body.innerText.replace(/\n+/g,' | ').slice(0,400)};
  })};
};
