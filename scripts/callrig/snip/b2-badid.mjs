export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  for(const [k,id] of [['nonexistent','V4OWZZZZZZZZZZZ'],['malformed','not-an-id']]){
    await page.goto(`https://airion-cargo.store/w/${WS}/call/${id}`, {waitUntil:'domcontentloaded'}).catch(()=>{});
    await page.waitForTimeout(6000);
    out[k]=await page.evaluate(()=>{
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const main=document.querySelector('main')||document.body;
      const all=[...main.querySelectorAll('button,a[href]')].filter(v);
      return {url:location.href.replace(/^https?:\/\/[^/]+/,''),
              text:(main.innerText||'').replace(/\n+/g,' | ').slice(0,220),
              n:all.length, items: all.map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8)};
    });
  }
  return out;
};
