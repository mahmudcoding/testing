// Polls the host's notification surface + hub live card while someone knocks elsewhere.
export default async ({page}) => {
  const secs = Number(process.env.QA_POLL_SECS || 120);
  const t0 = Date.now(); const tl=[]; let last='';
  const norm = s => (s||'').replace(/running \d+ min/g,'running N min').replace(/\d+:\d+/g,'⏱');
  while ((Date.now()-t0)/1000 < secs) {
    const s = await page.evaluate(async () => {
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      let api=null;
      try { const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'}); const j=await r.json(); api={n:(j.notifications||[]).length, unread:j.unread_count, total:j.total, first:(j.notifications||[])[0]?.type||null}; } catch(e){ api={err:String(e).slice(0,40)}; }
      const bell=[...document.querySelectorAll('button')].filter(v).find(x=>/notification/i.test(x.getAttribute('aria-label')||''));
      const bellText = bell ? (bell.innerText||'').replace(/\s+/g,' ').trim() : null;
      const bellLabel = bell ? (bell.getAttribute('aria-label')||'') : null;
      const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
      const live=body?[...body.querySelectorAll('section')].find(s=>/Live now/.test((s.innerText||'').slice(0,30))):null;
      const toasts=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean);
      return {api, bellText, bellLabel, live: live?(live.innerText||'').replace(/\n+/g,' | ').slice(0,220):null, toasts:[...new Set(toasts)]};
    }).catch(e=>({err:String(e).slice(0,60)}));
    const sig = JSON.stringify({...s, live: norm(s.live)});
    if(sig!==last){ tl.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; }
    await page.waitForTimeout(400);
  }
  return {changes: tl.length, timeline: tl.slice(0,14)};
};
