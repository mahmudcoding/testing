export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/meeting/.test(u)&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status(),b});}});
  const j = page.locator('button', {hasText:/^Join$/}).last();
  if (await j.count()) await j.click();
  await page.waitForTimeout(8000);
  out.screen = await page.evaluate(()=>{
    const vis=e=>e.getClientRects().length>0;
    return {url:location.pathname, txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-420),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(-8)};
  });
  out.net=net;
  return out;
};
