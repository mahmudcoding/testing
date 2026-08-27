export default async ({page}) => {
  const which = process.env.QA_ACT || 'Approve';
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('permission-request')){ let b=''; try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const btns = await page.$$('aside button');
  let clicked = null;
  for (const b of btns) {
    const l = (await b.getAttribute('aria-label'))||'';
    if (l.startsWith(which)) { await b.click(); clicked = l; break; }
  }
  await page.waitForTimeout(3500);
  const after = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('aside')].pop();
    return panel ? panel.innerText.replace(/\n+/g,' | ').slice(0,400) : null;
  });
  return {clicked, net, panelAfter: after};
};
