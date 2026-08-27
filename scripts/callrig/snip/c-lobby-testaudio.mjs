export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const CALL=process.env.QA_CALL;
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const lobby = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname, text:(m.innerText||'').replace(/\n+/g,' | ').slice(0,700),
      buttons:[...m.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,32), d:b.disabled}))};
  });
  // click Test audio
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(b=>b.getClientRects().length && /test audio/i.test((b.getAttribute('aria-label')||b.textContent||'')));
    if(!b) return false; b.click(); return true;
  });
  const samples=[]; const t0=Date.now();
  for (let i=0;i<50;i++){
    const s = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>(x.getAttribute('aria-label')||x.textContent||'').replace(/\s+/g,' ').trim());
      const testish = b.filter(l=>/test audio|playing/i.test(l));
      const au=[...document.querySelectorAll('audio')].map(a=>({p:a.paused, t:+a.currentTime.toFixed(2), d:isFinite(a.duration)?+a.duration.toFixed(2):null, ended:a.ended, src:(a.src||'').split('/').pop().slice(0,20)}));
      return {testish, au};
    });
    samples.push({ms: Date.now()-t0, ...s});
    await page.waitForTimeout(400);
    if (Date.now()-t0 > 18000) break;
  }
  // condense
  const cond=[]; let prev='';
  for (const s of samples){ const k=JSON.stringify([s.testish,s.au]); if(k!==prev){cond.push(s); prev=k;} }
  const finalButtons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,20));
  return {lobby, clicked, changes: cond.slice(0,14), lastSample: samples[samples.length-1], finalButtons};
};
