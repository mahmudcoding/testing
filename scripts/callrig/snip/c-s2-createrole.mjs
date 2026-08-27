export default async ({page}) => {
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,22));},true);});
  let click='no';
  try { await page.locator('button', {hasText:/^Create role$/}).first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL'; }
  await page.waitForTimeout(4000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const labels=[...document.querySelectorAll('label,li,[role="checkbox"],[role="switch"],p,span,div')]
      .filter(v).filter(e=>e.getBoundingClientRect().left>W*0.7 && e.children.length===0)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<44);
    return {landedOn:window.__c, rightPaneLeaves:[...new Set(labels)].slice(0,26)};
  });
};
