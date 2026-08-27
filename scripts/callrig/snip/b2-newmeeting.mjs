export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^New meeting$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true; } return false; }, V);
  await page.waitForTimeout(4000);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!dlg) return {clicked:true, noDialog:true};
    const txt=(dlg.innerText||'').replace(/\n+/g,' | ');
    return {txt: txt.slice(0,700),
      hasRepeat: /repeat|recur|повтор/i.test(txt),
      controls:[...dlg.querySelectorAll('button,input,select')].filter(vis)
        .map(e=>({t:(e.getAttribute('aria-label')||e.innerText||e.placeholder||'').replace(/\s+/g,' ').trim().slice(0,30), tag:e.tagName, type:e.type||undefined}))
        .filter(x=>x.t).slice(0,26)}; }, V);
};
