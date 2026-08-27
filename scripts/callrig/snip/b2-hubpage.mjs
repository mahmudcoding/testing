export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const read = () => page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const rec=[...body.querySelectorAll('section')].find(s=>/Recent calls/.test((s.innerText||'').slice(0,40)));
    const tabs=[...(rec||body).querySelectorAll('[role=tab],button')].filter(v).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/·/.test(t));
    const loadmore=[...(rec||body).querySelectorAll('button')].filter(v).filter(b=>/load more|loading more|show more/i.test(b.innerText||'')).map(b=>({t:(b.innerText||'').trim(), dis:b.disabled}));
    // count call rows: direct children of the list under Recent calls
    const rows=[...(rec||body).querySelectorAll('[data-testid*="recent"],[class*="RecentCallRow"]')].filter(v).length;
    const allBtns=[...(rec||body).querySelectorAll('button')].filter(v);
    return {tabs, loadmore, rows, nBtns: allBtns.length,
            lastBtns: allBtns.slice(-6).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))};
  });
  return {before: await read()};
};
