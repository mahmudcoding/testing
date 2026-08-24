export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(/guest|invite|link/i.test(u)&&u.includes('/api/')){let b='';try{b=(await r.text()).slice(0,400);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const dom = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    if(!d) return {none:true};
    return {
      inputs: [...d.querySelectorAll('input,textarea')].map(i=>`${i.type}|${i.value}|${i.readOnly}`),
      links: [...d.querySelectorAll('a')].map(a=>a.href),
      codeish: [...d.querySelectorAll('code,[data-testid*="link" i],[class*="link" i]')].map(e=>e.textContent.trim().slice(0,140)).filter(Boolean).slice(0,8),
      full: d.innerText.replace(/\n+/g,' | ').slice(0,600)
    };
  });
  // click Create new link to force generation and capture the API
  const dlg = (await page.$$('[role="dialog"]')).pop();
  const btns = await dlg.$$('button');
  for (const b of btns) { const t=(await b.innerText()).trim(); if (/Create new link/i.test(t)) { await b.click(); break; } }
  await page.waitForTimeout(4000);
  const dom2 = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return d? {inputs:[...d.querySelectorAll('input')].map(i=>i.value), full: d.innerText.replace(/\n+/g,' | ').slice(0,500)} : {none:true};
  });
  return {dom, net: netlog, dom2};
};
