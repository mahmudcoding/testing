export default async ({page}) => {
  const b1 = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].filter(x=>x.getClientRects().length)
      .find(x=>/stop recording|^recording$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if(!b) return {err:'no stop btn', seen:[...r.querySelectorAll('button')].filter(x=>x.getClientRects().length).map(x=>x.getAttribute('aria-label')).filter(l=>l&&/record/i.test(l))};
    b.click(); return {clicked:(b.getAttribute('aria-label')||b.textContent||'').trim()};
  });
  await page.waitForTimeout(2500);
  const dlg = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
      .map(d=>({t:(d.innerText||'').replace(/\s+/g,' ').slice(0,140), b:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,24))}));
  });
  return {b1, dlg};
};
