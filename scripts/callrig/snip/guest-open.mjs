export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} if(/guest|join|meeting/.test(u)) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto(process.env.QA_URL,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const body = await page.evaluate(()=>({url:location.href, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,700),
    inputs: [...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}`),
    btns: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,15)}));
  return {body, net: netlog};
};
