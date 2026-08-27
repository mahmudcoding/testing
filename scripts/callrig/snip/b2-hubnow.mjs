export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const pick=re=>{const x=[...body.querySelectorAll('section')].find(s=>re.test((s.innerText||'').slice(0,40))); return x?{txt:(x.innerText||'').replace(/\n+/g,' | ').slice(0,300), ctl:[...x.querySelectorAll('button,a[href]')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))}:null;};
    return {url:location.href, live:pick(/Live now/), sched:pick(/Scheduled today/)};
  });
};
