export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(350); }
  const isParts = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Participants/.test((p.innerText||'').trim());});
  for(let i=0;i<4 && !(await isParts()); i++){
    await page.click('button[data-testid="call-controls-people-toggle"]'); await page.waitForTimeout(1800);
  }
  if(!(await isParts())) return {err:'no participants panel'};
  const idx = Number(process.env.QA_IDX||2);   // 2 = carol
  const o = await page.evaluate((idx)=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const t=[...p.querySelectorAll('button')].filter(vis).filter(b=>/participant actions/i.test(b.getAttribute('aria-label')||''));
    if(!t[idx]) return {err:'no trigger', n:t.length}; t[idx].click(); return {ok:true};}, idx);
  if(o.err) return o;
  await page.waitForTimeout(1600);
  const c = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const m=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=m[m.length-1]; if(!p) return {err:'no menu'};
    const it=[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis)
      .find(x=>/^Device permissions/i.test((x.textContent||'').trim()));
    if(!it) return {err:'no item'}; it.click(); return {ok:true};});
  if(c.err) return c;
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const m=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=m[m.length-1]; if(!p) return {err:'no dialog'};
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,320),
      switches:[...p.querySelectorAll('[role="switch"],[role="checkbox"],input[type=checkbox]')]
        .map(s=>((s.closest('label')||s.parentElement||{}).innerText||'').replace(/\s+/g,' ').trim().slice(0,34)+'='+(s.getAttribute('aria-checked')||s.checked)),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.textContent||'').trim()).slice(0,38))};});
};
