export default async ({page}) => {
  const tok = process.env.QA_TOKEN;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  // find the guest join url shape
  for (const path of ['/call/join/'+tok, '/join/'+tok, '/guest/'+tok]) {
    await page.goto('https://airion-cargo.store'+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2500);
    const t = await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,300));
    if (!/404|not found|no longer valid/i.test(t) && t.length>40) return {path, text:t, net: net.slice(-6),
      inputs: await page.evaluate(()=>[...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}`)),
      buttons: await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)).filter(Boolean))};
  }
  return {none: true, net: net.slice(-8), last: await page.evaluate(()=>document.body.innerText.slice(0,300))};
};
