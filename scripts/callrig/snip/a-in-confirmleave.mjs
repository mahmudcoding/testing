export default async ({page}) => {
  const c = await page.evaluate(()=>{
    const vis=e=>{const b=e.getBoundingClientRect();return b.width>2&&b.height>2;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=d[d.length-1]; if(!pick) return {err:'no dialog'};
    const b=[...pick.querySelectorAll('button')].filter(vis).find(x=>/^Leave room$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no confirm btn'};
    b.click(); return {ok:true};
  });
  await page.waitForTimeout(8000);
  const after = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const txt=(r.innerText||'').replace(/\n+/g,' | ');
    return {head:txt.slice(0,150),
      stillInRoom:/QA Side B \| \d+:\d+/.test(txt),
      tiles:[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(x=>(x.getAttribute('aria-label')||'').replace('Participant actions for ',''))};
  });
  return {c, after};
};
