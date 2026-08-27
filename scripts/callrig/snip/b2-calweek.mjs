export default async ({page}) => {
  const WS='W4QBF1XTURESO01', TITLE=process.env.QA_TITLE||'QA recurring daily';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  return await page.evaluate(({v,title})=>{ const vis=eval(v);
    const chips=[...document.querySelectorAll('button,[data-testid="calendar-event-chip"]')].filter(vis)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>t.includes(title));
    const main=document.querySelector('main')||document.body;
    return {occurrences: chips, count: chips.length,
            headerDays: (main.innerText||'').replace(/\n+/g,' | ').slice(0,220)}; }, {v:V, title:TITLE});
};
