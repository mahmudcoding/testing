export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const btns=[...document.querySelectorAll('button')].filter(v).map(b=>({al:b.getAttribute('aria-label')||'', pressed:b.getAttribute('aria-pressed'), tid:b.getAttribute('data-testid')}));
    const mic=btns.filter(b=>/^(Mute|Unmute)$/.test(b.al));
    const surf=document.querySelector('[data-testid="call-surface"]');
    return {micButtons:mic, surface: surf?(surf.innerText||'').replace(/\n+/g,' | ').slice(0,200):null,
      toolbar: btns.filter(b=>b.tid && b.tid.startsWith('call-controls')).map(b=>b.tid)};
  });
};
