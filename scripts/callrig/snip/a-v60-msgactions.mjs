const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const info = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=[...document.querySelectorAll('[data-message-id]')].filter(vis);
    const mine=m.filter(x=>/V60-SAVED/.test(x.innerText||''));
    const last=mine[mine.length-1]||m[m.length-1];
    return {total:m.length,id:last?.getAttribute('data-message-id'),txt:(last?.innerText||'').replace(/\s+/g,' ').slice(0,60)};},VS);
  const el = await page.$(`[data-message-id="${info.id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
  const actions = await page.evaluate(([vs,id])=>{const vis=eval(vs);
    const row=document.querySelector(`[data-message-id="${id}"]`);
    const inRow=[...row.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30),tid:b.getAttribute('data-testid')||''}));
    // toolbar often rendered as sibling/portal near the row
    const rect=row.getBoundingClientRect();
    const near=[...document.querySelectorAll('button')].filter(b=>{if(!vis(b))return false;const r=b.getBoundingClientRect();
      return r.top>rect.top-46&&r.bottom<rect.bottom+46&&!row.contains(b);})
      .map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,30),tid:b.getAttribute('data-testid')||''}));
    return {inRow, near};},[VS,info.id]);
  return { info, actions };
};
