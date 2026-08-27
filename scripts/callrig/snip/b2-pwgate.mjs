export default async ({page}) => {
  const PW=process.env.QA_PWTRY;
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const before = await page.evaluate((v)=>{ const vis=eval(v);
    const main=document.querySelector('main')||document.body;
    return {inputs:[...document.querySelectorAll('input')].filter(vis).map(i=>({type:i.type, ph:i.placeholder, al:i.getAttribute('aria-label'), tid:i.getAttribute('data-testid')})),
            gateText: (()=>{const t=main.innerText||''; const k=t.indexOf('password-protected'); return k>=0?t.slice(Math.max(0,k-60), k+260).replace(/\n+/g,' | '):t.slice(0,200);})(),
            btns:[...main.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,24), dis:b.disabled||undefined})).filter(x=>x.t)}; }, V);
  if (PW !== undefined) {
    const el = await page.$('input[type=password]');
    if (el) { await el.fill(PW); await page.waitForTimeout(400); }
    await page.evaluate((v)=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^join call$/i.test((x.innerText||'').trim()));
      if(b && !b.disabled) b.click(); }, V);
    await page.waitForTimeout(6000);
  }
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const main=document.querySelector('main')||document.body;
    return {url:location.href,
      err: [...main.querySelectorAll('[role=alert],[class*=error],[data-testid*=error],p,span,div')].filter(vis).map(e=>(e.innerText||'').trim()).filter(t=>t && t.length<120 && /wrong|incorrect|invalid|try again|не|error|password/i.test(t)).slice(0,6),
      inputs:[...document.querySelectorAll('input')].filter(vis).length,
      toasts:[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean))],
      inCall: !!document.querySelector('[data-testid="call-surface"]'),
      btns:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,24)).filter(Boolean).slice(0,12)}; }, V);
  return {before, after};
};
