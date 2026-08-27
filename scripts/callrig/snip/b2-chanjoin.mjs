export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH=process.env.QA_CHAN||'C4QBGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const banner = await page.evaluate((v)=>{ const vis=eval(v);
    const main=document.querySelector('main')||document.body;
    const btns=[...main.querySelectorAll('button')].filter(vis).map(b=>({al:b.getAttribute('aria-label')||'', t:(b.innerText||'').trim().slice(0,26)}));
    return {joinish: btns.filter(b=>/join/i.test(b.al+' '+b.t)).slice(0,5),
            text:(main.innerText||'').replace(/\n+/g,' | ').slice(0,260)}; }, V);
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^join( call)?$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return (b.innerText||'').trim(); } return null; }, V);
  await page.waitForTimeout(8000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^join( call|now)?$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled) b.click();
    return {url:location.href}; }, V);
  await page.waitForTimeout(8000);
  const st = await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="call-surface"]');
    return {inCall:!!s, surface:s?(s.innerText||'').replace(/\n+/g,' | ').slice(0,200):null, url:location.href}; });
  return {banner, clicked, after, st};
};
