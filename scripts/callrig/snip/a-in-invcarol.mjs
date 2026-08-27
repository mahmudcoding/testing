export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const isSide = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Side Rooms/.test((p.innerText||'').trim());});
  for(let i=0;i<4 && !(await isSide()); i++){
    await page.click('button[data-testid="call-controls-breakout-rooms"]'); await page.waitForTimeout(2000);
  }
  if(!(await isSide())) return {err:'no side panel'};
  await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('[data-testid="side-room-add-people"]')][0]; if(b)b.click();});
  await page.waitForTimeout(2500);
  const done = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no dialog'};
    const title=(p.innerText||'').replace(/\s+/g,' ').slice(0,60);
    const b=[...p.querySelectorAll('[data-testid="side-room-invite-invitee"]')].find(x=>/QA Carol/.test(x.textContent||''));
    if(!b) return {err:'no Carol row', title};
    b.click();
    const s=p.querySelector('[data-testid="side-room-invite-submit"]');
    if(!s) return {err:'no submit'};
    const chk=[...p.querySelectorAll('[data-testid="side-room-invite-invitee"]')].map(x=>(x.textContent||'').trim().slice(0,12)+'='+x.getAttribute('aria-checked'));
    if(s.disabled) return {err:'submit disabled', chk};
    s.click(); return {ok:true, title, chk};});
  await page.waitForTimeout(3000);
  return done;
};
