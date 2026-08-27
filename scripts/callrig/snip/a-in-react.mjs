export default async ({page}) => {
  await page.click('button[data-testid="call-controls-live-reaction"]');
  await page.waitForTimeout(2500);
  const menu = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no picker'};
    return {tid:p.getAttribute('data-testid'),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('aria-label')||'')+'|'+(b.textContent||'').trim()).slice(0,28)).slice(0,14)};
  });
  const sent = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no picker'};
    const b=[...p.querySelectorAll('button')].filter(vis)[0];
    if(!b) return {err:'no reaction btn'};
    const lbl=(b.getAttribute('aria-label')||b.textContent||'').trim();
    b.click(); return {clicked:lbl.slice(0,30)};
  });
  await page.waitForTimeout(2500);
  return {menu, sent};
};
