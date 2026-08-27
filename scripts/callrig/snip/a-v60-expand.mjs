const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.all = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30),t:(b.innerText||'').trim().slice(0,18)}))
      .filter(b=>/expand|maximi|restore|open call|return to call|full/i.test(b.al+b.t));},VS);
  for(const pat of [/Expand/i,/Maximi/i,/Return to call/i,/Open call/i]){
    const b = page.locator('button').filter({ hasText: pat }).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=String(pat); await page.waitForTimeout(4000); break; }
  }
  if(!out.clicked && out.all.length){
    const al = out.all[0].al;
    await page.locator(`button[aria-label="${al}"]`).first().click().catch(()=>{});
    out.clicked='aria:'+al; await page.waitForTimeout(4000);
  }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,120),
      endBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26)).filter(t=>/end|leave/i.test(t)) };},VS);
  return out;
};
