export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,320);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>/^(Начать звонок|Start call|Join)$/i.test(t));
  if (i<0) return {err:'no start btn', lab: lab.filter(Boolean).slice(0,25)};
  await all[i].click();
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>({url:location.href,
    overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    text: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.querySelector('main')).innerText.replace(/\n+/g,' | ').slice(0,350)}));
  return {clickedLabel: lab[i], net: netlog, after};
};
