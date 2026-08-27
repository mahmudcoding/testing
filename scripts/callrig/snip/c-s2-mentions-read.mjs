const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/mentions`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const main=document.querySelector('main')||document.body;
    const txt=main.innerText;
    return {url:location.href,
      hasDirect: /QA-S2-MENT-DIRECT2/.test(txt),
      hasAtAll: /QA-S2-ATALL/.test(txt),
      hasAtHere: /QA-S2-MENT-HERE/.test(txt),
      tabs:[...main.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.textContent||'').trim().slice(0,20)).filter(Boolean).slice(0,8),
      text: txt.replace(/\n+/g,' | ').slice(0,500)};
  });
};
