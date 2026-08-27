export default async ({page}) => {
  const want=process.env.QA_LABEL;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const btns=await page.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(l===want){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'not found: '+want};
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  const st=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return {url:location.href,
      dialog: m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,400), controls:[...m.querySelectorAll('button,input')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||e.placeholder||'').trim().slice(0,36),t:e.getAttribute('data-testid')}))}:null,
      inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
      main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,200)};
  });
  return {clicked, net, state: st};
};
