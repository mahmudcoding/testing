export default async ({page}) => {
  const c = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const pip=document.querySelector('[data-testid="pip-mini-call"],[data-testid="draggable-pip"]');
    if(!pip) return {err:'no pip'};
    const btns=[...pip.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim()).slice(0,24));
    const b=[...pip.querySelectorAll('button')].filter(vis)
      .find(x=>/expand|maximi|return|open|restore/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {err:'no expand btn', btns};
    b.click(); return {clicked:b.getAttribute('aria-label'), btns};});
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({
    overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    pip: !!document.querySelector('[data-testid="pip-mini-call"],[data-testid="draggable-pip"]'),
    tiles:[...document.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].length}));
  return {c, after};
};
