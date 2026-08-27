export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(11000);
  const enumerate=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return {head:(m.innerText||'').replace(/\s+/g,' ').slice(0,90),
      inputs:[...m.querySelectorAll('input,textarea')].filter(v)
        .map(i=>({ph:i.placeholder, al:i.getAttribute('aria-label'), type:i.type})),
      topControls:[...m.querySelectorAll('button,[role="button"]')].filter(v)
        .filter(b=>b.getBoundingClientRect().top<200)
        .map(b=>b.getAttribute('aria-label')||(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))
        .filter(Boolean).slice(0,12),
      messages:document.querySelectorAll('main [data-message-id]').length};});
  const out={initial:await enumerate()};
  // if there is a search field, exercise it
  const inp=page.locator('main input:visible').first();
  if(await inp.count()){
    const ph=await inp.getAttribute('placeholder');
    out.searchField=ph||await inp.getAttribute('aria-label');
    if(/search|поиск/i.test(out.searchField||'')){
      await inp.fill('QA-S2-SAVED-05'); await page.waitForTimeout(2000);
      out.afterSearch=await enumerate();
      await inp.fill('zzzznope'); await page.waitForTimeout(2000);
      out.afterNoMatch=await enumerate();
      await inp.fill(''); await page.waitForTimeout(1500);
      out.afterClear=await enumerate();
    }
  }
  return out;
};
