export default async ({page}) => {
  const r = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no dialog'};
    const b=[...p.querySelectorAll('[data-testid="side-room-invite-invitee"]')].filter(vis)
      .find(x=>/QA Bob/.test(x.textContent||''));
    if(!b) return {err:'no Bob row'};
    b.click();
    return {picked:'QA Bob', checked:b.getAttribute('aria-checked')};});
  if(r.err) return r;
  await page.waitForTimeout(800);
  const sub = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1];
    const chk=[...p.querySelectorAll('[data-testid="side-room-invite-invitee"]')].map(x=>(x.textContent||'').trim().slice(0,12)+'='+x.getAttribute('aria-checked'));
    const b=p.querySelector('[data-testid="side-room-invite-submit"]');
    if(!b) return {err:'no submit'}; if(b.disabled) return {err:'submit disabled', chk};
    b.click(); return {ok:true, chk};});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,220):null;});
  return {r, sub, after};
};
