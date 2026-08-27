export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const main=document.querySelector('main')||document.body;
    const toasts=[...new Set([...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))];
    return {url:location.href, main:(main.innerText||'').replace(/\n+/g,' | ').slice(0,500),
      toasts, allBody:(document.body.innerText||'').replace(/\n+/g,' | ').slice(200,700)};
  });
};
