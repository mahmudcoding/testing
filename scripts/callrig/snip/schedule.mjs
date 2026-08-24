export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,320);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>/^(Schedule meeting|Запланировать)$/i.test(t));
  if (i<0) return {err:'no schedule btn', lab: lab.slice(0,20)};
  await all[i].click();
  await page.waitForTimeout(3000);
  const form = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,700),
      fields:[...d.querySelectorAll('input,textarea,select')].map(e=>`${e.tagName}[${e.type||''}]|${e.getAttribute('aria-label')||e.placeholder||''}|${e.getAttribute('data-testid')||'-'}|val=${(e.value||'').slice(0,25)}`),
      btns:[...d.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)}#${b.getAttribute('data-testid')||'-'}`)} : 'no dialog';
  });
  return {form, net: netlog};
};
