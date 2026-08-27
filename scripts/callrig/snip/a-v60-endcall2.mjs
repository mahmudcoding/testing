const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV0O41LELEV7H',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.toolbar = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(t=>/end|leave|more/i.test(t));},VS);
  // "End for everyone" may live behind the toolbar's More
  let ef = page.locator('button', { hasText: /End for everyone/i }).first();
  if(!(await ef.count())){
    const more = page.locator('button[aria-label="More"]').last();
    if(await more.count()){ await more.click().catch(()=>{}); await page.waitForTimeout(1500); }
    ef = page.locator('button', { hasText: /End for everyone/i }).first();
  }
  out.endFound = await ef.count()>0;
  if(out.endFound){
    await ef.click(); await page.waitForTimeout(2500);
    out.confirm = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,22),tid:b.getAttribute('data-testid')||''}))}:null;},VS);
    const sub = page.locator('[data-testid="call-end-confirm-submit"]').first();
    if(await sub.count()){ await sub.click(); out.confirmed=true; }
    await page.waitForTimeout(8000);
  }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ended-alice.png'});
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,320) };},VS);
  return out;
};
