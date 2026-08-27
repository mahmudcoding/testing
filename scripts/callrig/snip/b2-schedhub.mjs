export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const sec=[...body.querySelectorAll('section')].find(s=>/Scheduled today/.test((s.innerText||'').slice(0,40)));
    return {
      schedText: sec?(sec.innerText||'').replace(/\n+/g,' | ').slice(0,400):null,
      schedControls: sec?[...sec.querySelectorAll('button,a[href]')].filter(v).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), tid:b.getAttribute('data-testid')||undefined, dis:b.disabled||undefined})):null,
      liveText: (()=>{const l=[...body.querySelectorAll('section')].find(s=>/Live now/.test((s.innerText||'').slice(0,30))); return l?(l.innerText||'').replace(/\n+/g,' | ').slice(0,200):null;})()
    };
  });
};
