export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const lbl = process.env.QA_LABEL;
  const b = await page.$(`button[aria-label="${lbl}"]`);
  if (!b) return {err:'missing '+lbl, have: await page.evaluate(()=>[...document.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')).filter(Boolean).slice(0,40))};
  await b.click({timeout:8000});
  await page.waitForTimeout(Number(process.env.QA_WAIT||5000));
  const after = await page.evaluate(()=>{const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body; return s.innerText.replace(/\n+/g,' | ').slice(0,500);});
  return {net: netlog, after};
};
