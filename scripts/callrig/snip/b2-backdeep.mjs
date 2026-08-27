// Fresh page: hub -> join -> Back once, then measure thoroughly (page kept open).
export default async ({ctx}) => {
  const WS='W4QBF1XTURESO01';
  const p = await ctx.newPage();
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await p.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(5000);
  await p.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
    if(b) b.click(); }, V);
  await p.waitForTimeout(9000);
  for(let k=0;k<4;k++){
    if(await p.evaluate(()=>!!document.querySelector('[data-testid="call-surface"]'))) break;
    await p.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
      if(b && !b.disabled) b.click(); }, V);
    await p.waitForTimeout(7000);
  }
  const joined = await p.evaluate(()=>({inCall:!!document.querySelector('[data-testid="call-surface"]'), url:location.href}));
  await p.goBack({waitUntil:'domcontentloaded'}).catch(()=>null);
  await p.waitForTimeout(8000);
  const after = await p.evaluate((v)=>{ const vis=eval(v);
    const surf=document.querySelector('[data-testid="call-surface"]');
    const pip=document.querySelector('[data-testid="pip-mini-call"]');
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(vis).map(e=>e.getAttribute('data-testid')))];
    const mic=[...document.querySelectorAll('button')].filter(vis).find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
    return {url:location.href,
      surfaceInDom: !!surf, surfaceVisible: surf?vis(surf):null,
      pipInDom: !!pip, pipVisible: pip?vis(pip):null,
      callIds: ids.filter(t=>/call|pip/i.test(t)).slice(0,14),
      micControl: mic?{al:mic.getAttribute('aria-label'), pressed:mic.getAttribute('aria-pressed')}:null,
      bodyHead:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,140)}; }, V);
  return {joined, after, note:'page left open on purpose'};
};
