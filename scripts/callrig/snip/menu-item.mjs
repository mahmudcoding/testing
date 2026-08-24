export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const item = process.env.QA_ITEM;
  let m=[...(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'))].pop();
  if (!m) { const btns = await page.$$('button[aria-label="Participant actions"]'); const i=Number(process.env.QA_IDX||1);
            if (btns[i]) { await btns[i].click(); await page.waitForTimeout(2000); } m=[...(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'))].pop(); }
  if (!m) return {err:'no menu'};
  const items = await m.$$('button,[role="menuitem"]');
  for (const it of items) { const t=(await it.innerText()).trim(); if (t===item||t.startsWith(item)) { await it.click(); await page.waitForTimeout(4500);
    const dlg = await page.evaluate(()=>[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded').map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,250)));
    return {clicked:t, net:netlog, dlg}; } }
  return {err:'no item '+item, have: await Promise.all(items.map(async i=>(await i.innerText()).trim()))};
};
