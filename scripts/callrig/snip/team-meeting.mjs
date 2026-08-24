export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/meeting|calendar/.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('main button', {hasText:'Team meeting'}).first().click();
  await page.waitForTimeout(2500);
  const d = await page.evaluate(()=>{
    const x=[...document.querySelectorAll('[role="dialog"]')].pop();
    return x? {title:(x.querySelector('h2')||{}).textContent, text:x.innerText.replace(/\n+/g,' | ').slice(0,600),
               fields:[...x.querySelectorAll('input,select,textarea')].map(i=>`${i.type}|${i.getAttribute('data-testid')||i.id}|${i.placeholder||''}`),
               btns:[...x.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`)}
      : {none:true, url: location.href, body: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  return {d, net};
};
