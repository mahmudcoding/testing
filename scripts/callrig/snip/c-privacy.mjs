export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/privacy`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const s = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname, text:m.innerText.replace(/\s+/g,' ').slice(0,900),
      btns:[...m.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,35)).filter(Boolean)};
  });
  return s;
};
