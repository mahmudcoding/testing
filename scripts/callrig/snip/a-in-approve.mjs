export default async ({page}) => {
  const row = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const r=document.querySelector('[data-testid="permission-request-row"]');
    if(!r) return {err:'no request row'};
    return {text:(r.innerText||'').replace(/\s+/g,' ').slice(0,80),
      btns:[...r.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('aria-label')||'')+'|'+(b.textContent||'').trim()).slice(0,30))};});
  if(row.err) return row;
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const r=document.querySelector('[data-testid="permission-request-row"]');
    const b=[...r.querySelectorAll('button')].filter(vis)
      .find(x=>/approve|allow|accept/i.test((x.getAttribute('aria-label')||x.textContent||'')));
    if(!b) return {err:'no approve btn'}; b.click(); return {ok:true, label:(b.getAttribute('aria-label')||b.textContent||'').trim()};});
  await page.waitForTimeout(4500);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,200):null;});
  return {row, clicked, after};
};
