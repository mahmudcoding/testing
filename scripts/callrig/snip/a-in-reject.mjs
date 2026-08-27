export default async ({page}) => {
  const row = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const r=document.querySelector('[data-testid="permission-request-row"]');
    if(!r) return {err:'no request row'};
    const b=[...r.querySelectorAll('button')].filter(vis).find(x=>/reject|deny/i.test((x.getAttribute('aria-label')||x.textContent||'')));
    if(!b) return {err:'no reject btn', text:(r.innerText||'').replace(/\s+/g,' ').slice(0,60)};
    const lbl=b.getAttribute('aria-label'); b.click(); return {clicked:lbl};});
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,160):null,
      rowStillThere: !!document.querySelector('[data-testid="permission-request-row"]')};});
  return {row, after};
};
