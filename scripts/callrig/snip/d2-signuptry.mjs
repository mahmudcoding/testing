// Submit signup cases and record request + what the screen says. QA_CASES json.
export default async ({page}) => {
  const cases = JSON.parse(process.env.QA_CASES||'[]');
  const out=[];
  for (const c of cases) {
    await page.goto('https://airion-cargo.store/signup',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    await page.evaluate(()=>{ window.__n=[]; window.__t0=performance.now();
      window.__id=setInterval(()=>{
        for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')){
          const t=(e.innerText||'').replace(/\s+/g,' ').trim(); if(!t) continue;
          let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
          const p=window.__n.find(x=>x.t===t);
          if(p){p.maxOp=Math.max(p.maxOp,o);} else window.__n.push({t,maxOp:o});
        }},150);
    });
    if (c.email!==undefined) await page.fill('input[name=email]', c.email);
    if (c.name!==undefined)  await page.fill('input[name=displayName]', c.name);
    if (c.pw!==undefined)    await page.fill('input[name=password]', c.pw);
    await page.waitForTimeout(700);
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
      if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    const t0=Date.now();
    await page.locator('button').filter({hasText:/^Create account$/}).first().click();
    await page.waitForTimeout(c.wait||6000);
    const ms=Date.now()-t0;
    page.off('response', on);
    const scr = await page.evaluate(()=>{
      clearInterval(window.__id);
      const inline=[...document.querySelectorAll('p,span,div')].map(e=>(e.innerText||'').trim())
        .filter(t=>t && t.length<130 && /(exist|already|invalid|required|must|least|charact|error|valid|check|sent|verif)/i.test(t));
      return {url:location.pathname+location.search, notices:window.__n,
              inline:[...new Set(inline)].slice(0,4), body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)};
    });
    out.push({case:c.n, ms, reqs, ...scr});
  }
  return out;
};
