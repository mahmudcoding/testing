const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const out={};
  out.dms = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('a')].filter(vis).map(a=>({t:(a.textContent||'').trim().slice(0,26), href:a.getAttribute('href')||''}))
      .filter(x=>/\/d\//.test(x.href));
  });
  if (out.dms.length) {
    await page.goto('https://airion-cargo.store'+out.dms[0].href,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out.dmView = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      const main=document.querySelector('main')||document.body;
      return {url:location.href, header:main.innerText.replace(/\n+/g,' | ').slice(0,160),
        msgCount: document.querySelectorAll('[data-message-id]').length,
        headerButtons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean).slice(0,14)};
    });
  }
  return out;
};
