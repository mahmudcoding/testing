export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const main = document.querySelector('main')||document.body;
    return {
      url: location.href,
      mainText: main.innerText.replace(/\s+/g,' ').trim().slice(0,400),
      mainButtons: [...main.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,20)
    };
  });
};
