// Polls the call surface ~350ms; signature ignores the duration clock and ping.
export default async ({page}) => {
  const secs = Number(process.env.QA_POLL_SECS || 70);
  const t0 = Date.now(); const tl=[]; let last='';
  const norm = s => (s||'').replace(/\d+:\d+/g,'⏱').replace(/\d+\s?ms/g,'⏳').replace(/running \d+ min/g,'running N min');
  while ((Date.now()-t0)/1000 < secs) {
    const s = await page.evaluate(() => {
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const surf=document.querySelector('[data-testid="call-surface"]')||document.querySelector('[data-testid="pip-mini-call"]')||document.querySelector('[data-testid="call-ended-overlay"]');
      const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
      const toasts=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],li[data-sonner-toast],[class*=toast]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,100)).filter(Boolean);
      const scope = surf || document.querySelector('main') || document.body;
      return {
        inCall: !!surf,
        surf: (scope.innerText||'').replace(/\n+/g,' | ').slice(0,320),
        btns: [...scope.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,24),
        special: ids.filter(t=>/ended|taken|recover|banner|notice|error|lifecycle|end-for|waiting|admit|deny/i.test(t)),
        toasts: [...new Set(toasts)]
      };
    }).catch(e=>({err:String(e).slice(0,60)}));
    const sig = JSON.stringify({...s, surf: norm(s.surf)});
    if(sig!==last){ tl.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; }
    await page.waitForTimeout(350);
  }
  return {changes: tl.length, timeline: tl.slice(0,18)};
};
