export default async ({page}) => {
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-rooms-new"]'); if(b)b.click();});
  await page.waitForTimeout(2000);
  const dlg = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded');
    const pick=d[d.length-1]; if(!pick) return {err:'no dialog'};
    return {tid:pick.getAttribute('data-testid'), text:(pick.innerText||'').replace(/\n+/g,' | ').slice(0,400),
      inputs:[...pick.querySelectorAll('input,textarea')].map(i=>({t:i.type,ph:i.placeholder,id:i.id})),
      switches:[...pick.querySelectorAll('[role="switch"],[role="checkbox"]')].map(s=>((s.closest('label')||s.parentElement||{}).innerText||'').replace(/\s+/g,' ').trim().slice(0,40)+' = '+s.getAttribute('aria-checked')),
      btns:[...pick.querySelectorAll('button')].filter(vis).map(b=>(b.textContent||'').trim().slice(0,26)+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':''))};
  });
  return dlg;
};
