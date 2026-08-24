export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  // close any side panel first
  for (const lbl of ['Close participants','Close chat','Close Side Rooms panel']) {
    const c = await page.$(`button[aria-label="${lbl}"]`); if (c) { await c.click().catch(()=>{}); await page.waitForTimeout(800); }
  }
  const b = await page.$('[data-testid="call-controls-leave"]');
  if (!b) return {err:'no leave btn'};
  const box = await b.boundingBox();
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(4000);
  const dlg = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded').map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,250)));
  return {net: netlog, dlg, after: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,250))};
};
