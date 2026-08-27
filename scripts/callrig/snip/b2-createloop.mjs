export default async ({page}) => {
  const N=Number(process.env.QA_N||4), WS='W4QBF1XTURESO01';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const results=[];
  for(let i=0;i<N;i++){
    await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    await page.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()==='Start now');
      if(b) b.click(); }, V);
    await page.waitForTimeout(2500);
    await page.evaluate(({v,gl})=>{ const vis=eval(v);
      const pick=x=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(y=>y.value===x); if(r) r.click();};
      pick('public'); pick('manual_admit'); pick(gl); }, {v:V, gl:(i%2===0?'everyone':'host_only')});
    await page.waitForTimeout(600);
    await page.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='calls-start-submit');
      if(b && !b.disabled) b.click(); }, V);
    await page.waitForTimeout(9000);
    const r = await page.evaluate(()=>{
      const e=document.querySelector('[data-testid="calls-start-submit-error"]');
      return {err: e?(e.innerText||'').replace(/\s+/g,' ').trim():null,
              inCall: !!document.querySelector('[data-testid="call-surface"]'),
              url: location.href}; });
    results.push({i, guestLink:(i%2===0?'everyone':'host_only'), ...r, mid:(r.url.match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null});
    // clean up if a call was created
    if(r.inCall){
      const mid=(r.url.match(/\/call\/([A-Za-z0-9]+)/)||[])[1];
      if(mid) await page.evaluate(async(m)=>{ await fetch(`/api/v1/meeting/${m}/end`,{method:'POST',credentials:'include'}); }, mid);
      await page.waitForTimeout(2500);
    }
  }
  return results;
};
