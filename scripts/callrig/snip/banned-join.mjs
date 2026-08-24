export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/join')||u.includes('/meeting')){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} if(r.request().method()!=='GET'||r.status()>=400) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const hub = await page.evaluate(()=>{
    const m=document.querySelector('main'); const i=m.innerText.indexOf('Сейчас идут');
    return {live: m.innerText.slice(i,i+200).replace(/\n+/g,' | '),
            joinBtns: [...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(t=>/Присоедин|Join/i.test(t))};
  });
  const all = await page.$$('main button');
  const labels = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = labels.findIndex(t=>/^Присоединиться$/i.test(t));
  if (i<0) return {hub, err:'no join btn'};
  await all[i].click();
  await page.waitForTimeout(7000);
  const after = await page.evaluate(()=>({url:location.href, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,500),
    toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,5)}));
  // if prejoin, try to join
  const all2 = await page.$$('button');
  const lab2 = await Promise.all(all2.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const j = lab2.findIndex(t=>/^Присоединиться$/i.test(t));
  let after2=null;
  if (j>=0) { await all2[j].click(); await page.waitForTimeout(7000);
    after2 = await page.evaluate(()=>({url:location.href, body: document.body.innerText.replace(/\n+/g,' | ').slice(0,500),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim()).filter(Boolean).slice(0,5)})); }
  return {hub, after, after2, net: netlog};
};
