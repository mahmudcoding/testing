export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`REQ ${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,140)}`);});
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&/share|link/.test(u)){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} netlog.push(`RES ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const btns = await page.$$('button');
  let clicked=null;
  for (const b of btns) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Share$/i.test(t)) { await b.click(); clicked='Share'; break; } }
  if (!clicked) return {err:'no Share btn', url: page.url()};
  await page.waitForTimeout(4000);
  const d = await page.evaluate(()=>{const x=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return x? {text:x.innerText.replace(/\n+/g,' | ').slice(0,400), inputs:[...x.querySelectorAll('input')].map(i=>i.value.slice(0,110))}:'no dialog';});
  const toasts = await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,4));
  return {clicked, d, toasts, net: netlog.slice(-5)};
};
