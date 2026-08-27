export default async ({page}) => {
  const WS='W4QBF1XTURESO01', DM=process.env.QA_DM;
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const controls = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>({al:b.getAttribute('aria-label')||'', t:(b.innerText||'').trim().slice(0,20)}))
      .filter(x=>/call|video|audio/i.test(x.al+' '+x.t)).slice(0,8); }, V);
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Start call|Call)$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(b){ b.click(); return (b.getAttribute('aria-label')||'').trim(); } return null; }, V);
  await page.waitForTimeout(7000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href, txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,240)}; }, V);
  return {controls, clicked, after};
};
