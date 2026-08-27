export default async ({page}) => {
  const r = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const m=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=m[m.length-1]; if(!p) return {err:'no dialog'};
    const blocks=[...p.querySelectorAll('button')].filter(vis).filter(b=>/^Block$/i.test((b.textContent||'').trim()));
    if(blocks.length<2) return {err:'blocks<2', n:blocks.length};
    blocks[1].click();   // Camera is the 2nd group
    return {ok:true, groups:blocks.length};});
  if(r.err) return r;
  await page.waitForTimeout(900);
  const save = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const m=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=m[m.length-1];
    const before=(p.innerText||'').replace(/\s+/g,' ').slice(0,220);
    const b=p.querySelector('[data-testid="device-permissions-save"]');
    if(!b) return {err:'no save'}; if(b.disabled) return {err:'save disabled', before};
    b.click(); return {ok:true, before};});
  await page.waitForTimeout(4000);
  return {r, save};
};
