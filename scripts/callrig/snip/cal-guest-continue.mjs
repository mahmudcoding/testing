export default async ({ctx}) => {
  const url = process.env.QA_URL;
  const p = await ctx.newPage();
  const net=[];
  p.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,260);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3500);
  await p.fill('input[type=text]','Early Guest');
  await p.waitForTimeout(500);
  const btnState = await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Continue/.test(x.textContent)); return {disabled:b.disabled};});
  await p.locator('button', {hasText:'Continue'}).first().click();
  await p.waitForTimeout(6000);
  const st = await p.evaluate(()=>({url:location.href,
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,600),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,150)).filter(Boolean),
    buttons: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34).trim()).filter(Boolean)}));
  await p.close();
  return {btnState, st, net: net.slice(-6)};
};
