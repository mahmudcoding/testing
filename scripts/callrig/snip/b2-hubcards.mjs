export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const cards = await page.evaluate((v)=>{ const vis=eval(v);
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const btns=[...body.querySelectorAll('button')].filter(vis)
      .filter(b=>/Team meeting|Webinar/i.test(b.innerText||''));
    return btns.map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), dis:b.disabled,
                          cursor:getComputedStyle(b).cursor, opacity:getComputedStyle(b).opacity,
                          ariaDisabled:b.getAttribute('aria-disabled')})); }, V);
  // click Team meeting
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Team meeting/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(4000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {url:location.href, dialog: dlg?(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,300):null}; }, V);
  return {cards, clicked, after};
};
