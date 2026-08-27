// Whole-document poller: catches portals, header bell, toasts, incoming-call surfaces.
export default async ({page}) => {
  const secs = Number(process.env.QA_POLL_SECS || 90);
  const t0 = Date.now(); const tl=[]; let last='';
  const norm = s => (s||'').replace(/\d+:\d+/g,'⏱').replace(/\d+\s?ms/g,'⏳').replace(/running \d+ min/g,'running N min');
  while ((Date.now()-t0)/1000 < secs) {
    const s = await page.evaluate(() => {
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
      const hot = ids.filter(t=>/incoming|ring|call-ended|taken|recover|banner|notice|toast|waiting|admit|deny|lifecycle/i.test(t));
      const inc = [...document.querySelectorAll('[data-testid^="incoming-call"]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120));
      const toasts=[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],ol[data-sonner-toaster] li,[class*=toast]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean))];
      const bell=[...document.querySelectorAll('button')].filter(v).find(x=>/notification/i.test(x.getAttribute('aria-label')||''));
      // any fixed-position overlay outside main
      const fixed=[...document.body.querySelectorAll('div,section,aside')].filter(e=>{ const c=getComputedStyle(e); return (c.position==='fixed'||c.position==='absolute') && v(e) && !e.closest('main') && (e.innerText||'').trim().length>8 && (e.innerText||'').length<300; }).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110));
      return {hot, inc, toasts, bell: bell?(bell.getAttribute('aria-label')||'').slice(0,40):null,
              fixed:[...new Set(fixed)].slice(0,6), url:location.href};
    }).catch(e=>({err:String(e).slice(0,60)}));
    const sig=JSON.stringify({...s, fixed:(s.fixed||[]).map(norm), toasts:(s.toasts||[]).map(norm)});
    if(sig!==last){ tl.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; }
    await page.waitForTimeout(300);
  }
  return {changes: tl.length, timeline: tl.slice(0,16)};
};
