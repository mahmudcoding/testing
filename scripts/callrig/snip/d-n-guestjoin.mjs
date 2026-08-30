export default async ({page}) => {
  const link=process.env.QA_LINK, name=process.env.QA_NAME||'QA Guest Visitor';
  const out={};
  await page.goto(link,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.url1=page.url();
  out.screen = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return {txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,400),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,20),
      inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>({ph:i.placeholder,type:i.type,tid:i.dataset.testid||null}))};
  });
  const nf = page.locator('input:visible').first();
  if (await nf.count()>0){ await nf.click(); await nf.fill(name); out.nameTyped=await nf.inputValue(); }
  for (const t of ['Join call','Join now','Join','Continue']) {
    const b = page.locator('button', {hasText:new RegExp('^'+t+'$')}).first();
    if (await b.count()>0 && await b.isVisible().catch(()=>false)){ const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2); out.clicked=t; await page.waitForTimeout(8000); break; }
  }
  out.url2=page.url();
  out.after = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return {txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,350),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,25)};
  });
  return out;
};
