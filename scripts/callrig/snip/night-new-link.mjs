export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('guest-link')){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const ms=await page.$$('[role="dialog"]');
  const m=ms[ms.length-1];
  const btns=await m.$$('button');
  let clicked=null;
  for (const b of btns){ const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/create new link/i.test(t)){ await b.click(); clicked=t; break; } }
  if(!clicked) return {err:'no Create new link'};
  await page.waitForTimeout(5000);
  const link=await page.evaluate(()=>{const e=document.querySelector('[data-testid="guest-links-created-url"]'); return e?(e.value||e.textContent||'').trim():null;});
  const toasts=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean));
  return {clicked, newLink: link, net, toasts};
};
