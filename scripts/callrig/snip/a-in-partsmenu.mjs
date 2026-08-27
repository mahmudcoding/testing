export default async ({page}) => {
  for(let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(400); }
  const isParts = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Participants/.test((p.innerText||'').trim());});
  for(let i=0;i<4 && !(await isParts()); i++){
    await page.click('button[data-testid="call-controls-people-toggle"]'); await page.waitForTimeout(2000);
  }
  if(!(await isParts())) return {err:'participants panel not open'};
  const opened = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const t=[...p.querySelectorAll('button')].filter(vis).filter(b=>/participant actions/i.test(b.getAttribute('aria-label')||''));
    if(t.length<2) return {err:'not enough triggers', n:t.length};
    t[1].click(); return {ok:true, n:t.length};});
  if(opened.err) return opened;
  await page.waitForTimeout(1800);
  const menu = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no menu'};
    return {items:[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,34))};});
  return {opened, menu};
};
