export default async ({page}) => {
  const rd = ()=> page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const txt=(r.innerText||'').replace(/\n+/g,' | ');
    const vis=e=>{const b=e.getBoundingClientRect();return b.width>2&&b.height>2;};
    return {head: txt.slice(0,120),
      dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
        .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
        .map(d=>({tid:d.getAttribute('data-testid'),t:(d.innerText||'').replace(/\s+/g,' ').slice(0,140),
          b:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,20))})),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(e=>{const b=e.getBoundingClientRect();return b.width>20&&b.height>10;}).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,80))};
  });
  const before = await rd();
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length)
      .find(x=>/^Leave room$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no Leave room button'};
    b.click(); return {ok:true, aria:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')};
  });
  const seq=[]; let last='';
  for(let i=0;i<40;i++){ const s=await rd(); const k=JSON.stringify(s);
    if(k!==last){ seq.push({t:i*300, ...s}); last=k; }
    await page.waitForTimeout(300); }
  return {before, clicked, seq};
};
