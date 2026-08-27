export default async ({page}) => {
  const overlayCam = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>/^Turn camera (on|off)$/i.test(x.getAttribute('aria-label')||''));
    return b?{aria:b.getAttribute('aria-label'), disabled:b.disabled}:null;});
  await page.click('button[data-testid="call-surface-minimize"]');
  await page.waitForTimeout(3000);
  const pip = await page.evaluate(()=>{
    const vis=e=>{const q=e.getBoundingClientRect();return q.width>3&&q.height>3;};
    const p=document.querySelector('[data-testid="pip-mini-call"],[data-testid="draggable-pip"]');
    if(!p) return {err:'no pip'};
    return {btns:[...p.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim()).slice(0,24)+(b.disabled?' [disabled]':''))};});
  return {overlayCam, pip};
};
