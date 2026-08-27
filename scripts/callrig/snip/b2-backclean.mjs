// Fresh page, clean history: workspace -> join a call from the hub -> press Back once.
export default async ({ctx}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  const p = await ctx.newPage();
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  try{
    await p.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
    await p.waitForTimeout(5000);
    const entries1 = await p.evaluate(()=>history.length);
    // join via the hub's Live now Join button (one in-app navigation)
    await p.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
      if(b) b.click(); }, V);
    await p.waitForTimeout(9000);
    for(let k=0;k<4;k++){
      const done = await p.evaluate(()=>!!document.querySelector('[data-testid="call-surface"]'));
      if(done) break;
      await p.evaluate((v)=>{ const vis=eval(v);
        const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
        if(b && !b.disabled) b.click(); }, V);
      await p.waitForTimeout(7000);
    }
    const inCall = await p.evaluate(()=>({url:location.href, entries:history.length,
      inCall: !!document.querySelector('[data-testid="call-surface"]')}));
    await p.goBack({waitUntil:'domcontentloaded'}).catch(()=>null);
    await p.waitForTimeout(7000);
    const after = await p.evaluate(()=>({url:location.href, entries:history.length,
      inCall: !!document.querySelector('[data-testid="call-surface"]'),
      pip: !!document.querySelector('[data-testid="pip-mini-call"]'),
      body:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,150)}));
    return {entriesAtHub: entries1, inCall, after};
  } finally { await p.close().catch(()=>{}); }
};
