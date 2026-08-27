export default async ({page}) => {
  // close any open panel, then open Side Rooms deterministically
  const isSide = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Side Rooms/.test((p.innerText||'').trim());});
  for (let i=0;i<3 && !(await isSide()); i++){
    await page.click('button[data-testid="call-controls-breakout-rooms"]');
    await page.waitForTimeout(2200);
  }
  return await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    return {text:(p.innerText||'').replace(/\n+/g,' | ').slice(0,420),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,24)))};
  });
};
