const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV0O41LELEV7H',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.landing = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean).slice(-14),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  // press a join-ish control if present
  for (const label of ['Join now','Join call','Join','Ask to join']) {
    const b = page.locator('button', { hasText: new RegExp('^'+label+'$') }).first();
    if (await b.count()) { await b.click().catch(()=>{}); out.clicked=label; await page.waitForTimeout(6000); break; }
  }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, vids:document.querySelectorAll('video').length,
      hasLeave: [...document.querySelectorAll('button')].filter(vis).some(b=>/Leave call/i.test(b.getAttribute('aria-label')||b.innerText||'')),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  return out;
};
