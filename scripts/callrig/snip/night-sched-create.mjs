export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && r.url().includes('calendar')){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const t=(await b.innerText()).trim(); if(/^Schedule meeting/.test(t)){ await b.click(); clicked=t; break; } }
  if(!clicked) return {err:'no Schedule meeting'};
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,700),
      inputs:[...m.querySelectorAll('input,textarea,select')].map(i=>({t:i.type,ph:i.placeholder,v:String(i.value).slice(0,24),id:i.id,tid:i.getAttribute('data-testid')})),
      buttons:[...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32),tid:b.getAttribute('data-testid')}))}:null;
  });
};
