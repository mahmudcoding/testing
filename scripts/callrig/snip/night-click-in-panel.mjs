export default async ({page}) => {
  const want=process.env.QA_BTN;
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,260);}catch(e){} if(/meeting|dm|call/i.test(r.url())) net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  const ms=await page.$$('[role="dialog"],aside');
  const m=ms[ms.length-1];
  const btns=await m.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(l===want){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'not found: '+want};
  await page.waitForTimeout(7000);
  const st=await page.evaluate(()=>({url:location.href, main:(document.querySelector('main')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,220),
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean)}));
  return {clicked, net, state: st};
};
