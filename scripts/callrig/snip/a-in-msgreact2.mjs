export default async ({page}) => {
  const open = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^React$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no React btn'}; b.click(); return {ok:true};});
  if(open.err) return open;
  await page.waitForTimeout(2000);
  const picker = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no picker'};
    return {btns:[...p.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('aria-label')||'')+'|'+(b.textContent||'').trim()).slice(0,20)).slice(0,12)};});
  const sent = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no picker'};
    const b=[...p.querySelectorAll('button')].filter(vis)[0]; if(!b) return {err:'no emoji'};
    const l=(b.getAttribute('aria-label')||b.textContent||'').trim(); b.click(); return {clicked:l.slice(0,20)};});
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null;});
  return {picker, sent, after};
};
