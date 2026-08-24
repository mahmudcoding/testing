export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('calendar')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // go to Aug 25 (next day) via Next
  await page.locator('main button, header button').filter({hasText:'Next'}).first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  const evs = await page.evaluate(()=>[...document.querySelectorAll('main button,[role="button"]')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,50)).filter(t=>/QA Probe|QA Recur/.test(t)));
  if (!evs.length) return {none:true, sample: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400))};
  await page.locator('main button', {hasText:'QA Probe'}).first().click();
  await page.waitForTimeout(2500);
  const d = await page.evaluate(()=>{const x=[...document.querySelectorAll('[role="dialog"]')].pop(); return x? {text:x.innerText.replace(/\n+/g,' | ').slice(0,500), btns:[...x.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)}#${b.getAttribute('data-testid')||'-'}`)}:null;});
  return {evs, detail: d, net};
};
