export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btns = await page.evaluate(()=>[...document.querySelectorAll('main button, header button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>x&&!x.startsWith('#')).slice(0,40));
  const callBtn = await page.$('button[aria-label*="call" i]') || await page.$('[data-testid*="call" i]');
  let after=null;
  if (callBtn) { await callBtn.click().catch(()=>{}); await page.waitForTimeout(5000);
    after = await page.evaluate(()=>({dialogs:[...document.querySelectorAll('[role="dialog"]')].map(d=>d.innerText.replace(/\n+/g,' | ').slice(0,400)), body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)})); }
  return {btns, clicked: !!callBtn, after, net: netlog};
};
