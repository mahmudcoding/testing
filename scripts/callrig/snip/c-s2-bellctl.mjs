export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const out={};
  const bell=page.locator('button[aria-label*="otification"], button[aria-label*="Bell"]').first();
  out.bellCount=await bell.count();
  out.bellLabel=out.bellCount?await bell.getAttribute('aria-label'):null;
  await bell.click({timeout:6000}).catch(()=>{out.openFail=true});
  await page.waitForTimeout(4000);
  out.panel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const cands=[...document.querySelectorAll('[role="dialog"],[role="menu"],aside,div')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();
        return b.left>W*0.45 && b.width>250 && b.width<700 && b.height>200;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const p=cands.find(e=>/notification|уведомл/i.test(e.innerText||'')) || cands[0];
    if(!p) return 'NO-PANEL';
    return {size:`${Math.round(p.getBoundingClientRect().width)}x${Math.round(p.getBoundingClientRect().height)}`,
      controls:[...new Set([...p.querySelectorAll('button,a,[role="tab"]')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,34)))].slice(0,16),
      head:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,120)};});
  return out;
};
