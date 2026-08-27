export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(9000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3||r.top>200) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const m=document.querySelector('main');
    return {url:location.pathname.slice(-18),
      head:(m.innerText||'').replace(/\s+/g,' ').slice(0,60),
      controls:[...m.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>({al:b.getAttribute('aria-label'), t:(b.innerText||'').trim().slice(0,18),
          y:Math.round(b.getBoundingClientRect().top)}))};});
};
