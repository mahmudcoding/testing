export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const grab = () => page.evaluate((v)=>{ const vis=eval(v);
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,a[href],[role=tab]')].filter(vis)
      .map(e=>({t:(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,36), tid:e.getAttribute('data-testid')||undefined}))
      .filter(x=>x.t); }, V);
  const tabs = {};
  tabs.default = await grab();
  for (const label of ['Chat','Logs']) {
    await page.evaluate(({v,l})=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button,[role=tab]')].filter(vis).find(x=>new RegExp('^'+l).test((x.innerText||'').replace(/\s+/g,' ').trim()));
      if(b) b.click(); }, {v:V, l:label});
    await page.waitForTimeout(3000);
    tabs[label]=await grab();
  }
  return tabs;
};
