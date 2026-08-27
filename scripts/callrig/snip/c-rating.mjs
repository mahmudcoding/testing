export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{ if(/rating/i.test(r.url())){ let b=''; try{b=(await r.text()).slice(0,180);}catch(e){} net.push({m:r.request().method(), s:r.status(), req:(r.request().postData()||'').slice(0,80), b}); }});
  const id = await page.evaluate(()=>location.pathname.split('/call/')[1]);
  out.id=id;
  out.clicked4 = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^4 stars$/.test(x.getAttribute('aria-label')||'')); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(2500);
  out.afterClick = await page.evaluate(()=>{
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    const i=body.search(/RATE QUALITY/i);
    return i<0? null : body.slice(i, i+120);
  });
  out.net1 = net.slice();
  // reload
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(()=>{
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    return {url:location.pathname, hasRate:/RATE QUALITY/i.test(body), stars:[...document.querySelectorAll('button')].filter(b=>/stars/i.test(b.getAttribute('aria-label')||'')).length, snippet: body.slice(0,220)};
  });
  // open the ended call by its own URL
  await page.goto(`https://airion-cargo.store/w/W4QCF1XTURESO01/call/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.byUrl = await page.evaluate(()=>{
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    return {url:location.pathname, hasRate:/RATE QUALITY|rating/i.test(body), snippet: body.slice(-260)};
  });
  // details page
  await page.goto(`https://airion-cargo.store/w/W4QCF1XTURESO01/calls/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.details = await page.evaluate(()=>{
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    return {url:location.pathname, hasRate:/RATE QUALITY|rating|quality/i.test(body), stars:[...document.querySelectorAll('button')].filter(b=>/stars/i.test(b.getAttribute('aria-label')||'')).length, snippet: body.slice(-320)};
  });
  out.server = await page.evaluate(async (id)=>(await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).text()).slice(0,120)+'|'+ (await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).text()).match(/"(average|count|my_rating)":[^,}]*/g), id);
  out.net = net;
  return out;
};
