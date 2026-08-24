export default async ({ctx}) => {
  const url = process.env.QA_URL;
  const p = await ctx.newPage();
  const net=[];
  p.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(4000);
  const st = await p.evaluate(()=>({url:location.href,
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,500),
    inputs: [...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}`),
    buttons: [...document.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34)}${b.disabled?' DIS':''}`).filter(Boolean)}));
  await p.close();
  return {st, net: net.slice(-5)};
};
