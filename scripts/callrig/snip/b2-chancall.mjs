export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH=process.env.QA_CHAN||'C4QBGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const header = await page.evaluate((v)=>{ const vis=eval(v);
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>({al:b.getAttribute('aria-label')||'', t:(b.innerText||'').trim().slice(0,24), tid:b.getAttribute('data-testid')}));
    return {callish: btns.filter(b=>/call|video|audio/i.test(b.al+' '+b.t+' '+(b.tid||''))).slice(0,8)}; }, V);
  return {url:page.url(), header};
};
