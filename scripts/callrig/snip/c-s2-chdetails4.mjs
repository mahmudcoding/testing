export default async ({page}) => {
  const snap=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const right=[...document.querySelectorAll('button,h1,h2,h3,[role="tab"],label')]
      .filter(v).filter(e=>{const r=e.getBoundingClientRect();
        return r.left>W*0.62 && r.top>0 && r.top<innerHeight;})
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30));
    return {n:right.length, items:[...new Set(right)].slice(0,14)};
  });
  const before=await snap();
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push((t.getAttribute&&t.getAttribute('aria-label'))||(t.innerText||'').slice(0,20));},true);});
  let click='no';
  try { await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL'; }
  await page.waitForTimeout(4000);
  const after=await snap();
  const landed=await page.evaluate(()=>window.__c);
  return {before, click, landedOn:landed, after};
};
