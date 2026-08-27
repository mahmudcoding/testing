export default async ({page}) => {
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const before = await page.evaluate((v)=>{ const vis=eval(v);
    const inp=document.querySelector('[data-testid="call-password-input"]');
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,24), dis:b.disabled}));
    return {fieldValue: inp?inp.value:null, joinBtn: btns.find(b=>/join call/i.test(b.t))||null, allBtns: btns.filter(b=>b.t).slice(-6)}; }, V);
  // try submitting with the field as-is (empty)
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^join call$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(7000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const surf=document.querySelector('[data-testid="call-surface"]');
    return {inCall:!!surf, body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(180,430),
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {before, clicked, after};
};
