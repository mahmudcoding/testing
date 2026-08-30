export default async ({page}) => {
  const id = process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QDF1XTURESO01/call/${id}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const out = {url:page.url()};
  out.state = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return {btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,40),
      body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
  // if there is a Join / lobby button click it
  for (const t of ['Join call','Join now','Join']) {
    const b = page.locator('button', {hasText:new RegExp('^'+t+'$')}).first();
    if (await b.count()>0 && await b.isVisible().catch(()=>false)) { await b.click(); out.clicked=t; await page.waitForTimeout(5000); break; }
  }
  out.url2 = page.url();
  out.after = await page.evaluate(()=>({tiles:document.querySelectorAll('[data-testid*="participant-tile"],[data-testid*="tile"]').length,
    body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)}));
  return out;
};
