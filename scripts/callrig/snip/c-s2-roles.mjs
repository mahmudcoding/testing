export default async ({page}) => {
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true);});
  const tab=page.locator('button', {hasText:/^Roles$/}).first();
  let click='no';
  try { await tab.click({timeout:6000}); click='ok'; } catch(e){ click='FAIL'; }
  await page.waitForTimeout(4000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
      .filter(e=>{const r=e.getBoundingClientRect();return r.left>W*0.7&&r.width>200&&r.height>300;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {landedOn:window.__c,
      paneText: pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,420):'NO-PANE'};
  });
};
