export default async ({page}) => {
  const open = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^React$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no React btn'}; b.click(); return {ok:true};});
  if(open.err) return open;
  await page.waitForTimeout(2000);
  const sent = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no picker'};
    const b=[...p.querySelectorAll('button')].filter(vis)
      .find(x=>/^Grinning face$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return {err:'no labelled emoji'};
    b.click(); return {clicked:b.getAttribute('aria-label')};});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,240):null;});
  return {sent, after, hasEmoji: /\u{1F600}/u.test(after||'')};
};
