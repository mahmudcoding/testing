export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const isSide = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Side Rooms/.test((p.innerText||'').trim());});
  for(let i=0;i<4 && !(await isSide()); i++){
    await page.click('button[data-testid="call-controls-breakout-rooms"]'); await page.waitForTimeout(2000);
  }
  if(!(await isSide())) return {err:'side rooms panel not open'};
  const opened = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const b=[...p.querySelectorAll('[data-testid="side-room-add-people"]')].filter(vis)[0];
    if(!b) return {err:'no Add people btn'}; b.click(); return {ok:true};});
  if(opened.err) return opened;
  await page.waitForTimeout(2500);
  const dlg = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no dialog'};
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,260),
      btns:[...p.querySelectorAll('button')].filter(vis).map(x=>((x.getAttribute('data-testid')||'')+'|'+(x.textContent||'').trim()).slice(0,40))};});
  return {dlg};
};
