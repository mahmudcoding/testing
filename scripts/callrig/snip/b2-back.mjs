export default async ({page}) => {
  const before = await page.evaluate(()=>({url:location.href,
    inCall: !!document.querySelector('[data-testid="call-surface"]'),
    pip: !!document.querySelector('[data-testid="pip-mini-call"]')}));
  await page.goBack({waitUntil:'domcontentloaded'}).catch(e=>null);
  await page.waitForTimeout(7000);
  const after = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    return {url:location.href,
      inCall: !!document.querySelector('[data-testid="call-surface"]'),
      pip: !!document.querySelector('[data-testid="pip-mini-call"]'),
      notices:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean))],
      body:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,180)};
  });
  return {before, after};
};
