export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const all=[...body.querySelectorAll('button,a[href],[role=tab],input,select')].filter(v);
    const rowish = t => /(Outbound|Incoming)\s*·/.test(t);
    const seen=new Set(); const uniq=[];
    for(const e of all){
      const t=(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').replace(/\s+/g,' ').trim();
      if(!t || rowish(t)) continue;
      const key=t.slice(0,40);
      if(seen.has(key)) continue;
      seen.add(key);
      uniq.push({t:key, tag:e.tagName, tid:e.getAttribute('data-testid')||undefined, dis:e.disabled||undefined});
    }
    return {distinctControls: uniq.length, controls: uniq,
            rowCount: all.filter(e=>rowish((e.innerText||''))).length};
  });
};
