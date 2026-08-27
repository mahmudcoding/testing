export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const chips = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[data-testid="calendar-event-chip"],button')].filter(vis)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/sched guest link/i.test(t)).slice(0,3); }, V);
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button,[data-testid="calendar-event-chip"]')].filter(vis)
      .find(x=>/sched guest link/i.test((x.innerText||'')));
    if(b){ b.scrollIntoView({block:'center'}); b.click(); return true; } return false; }, V);
  await page.waitForTimeout(4000);
  const dlg = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return null;
    return {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,500),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,32)).filter(Boolean),
      hasLinkInput: [...d.querySelectorAll('input')].some(i=>/join/.test(i.value||''))}; }, V);
  return {chips, clicked, dlg};
};
