export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  if(!/\/calls$/.test(location?.href||'')) { await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(4000); }
  const secs=Number(process.env.QA_POLL_SECS||120);
  const t0=Date.now(); const tl=[]; let last='';
  const norm=s=>(s||'').replace(/running \d+ min/g,'running N min').replace(/\d+:\d+/g,'⏱');
  while((Date.now()-t0)/1000<secs){
    const s = await page.evaluate(()=>{
      const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
      const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
      const pick=re=>{const x=[...body.querySelectorAll('section')].find(s=>re.test((s.innerText||'').slice(0,40))); return x?{txt:(x.innerText||'').replace(/\n+/g,' | ').slice(0,260), ctl:[...x.querySelectorAll('button,a[href]')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))}:null;};
      const toasts=[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))];
      const bell=[...document.querySelectorAll('button')].filter(v).find(x=>/notification/i.test(x.getAttribute('aria-label')||''));
      return {live:pick(/Live now/), sched:pick(/Scheduled today/), toasts, bell:bell?(bell.getAttribute('aria-label')||''):null};
    }).catch(e=>({err:String(e).slice(0,50)}));
    const sig=JSON.stringify({live:s.live?{...s.live,txt:norm(s.live.txt)}:null, sched:s.sched, toasts:s.toasts, bell:s.bell});
    if(sig!==last){ tl.push({t:+((Date.now()-t0)/1000).toFixed(1), ...s}); last=sig; }
    await page.waitForTimeout(350);
  }
  return {changes:tl.length, timeline: tl.slice(0,14)};
};
