export default async ({page}) => {
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));},true);});
  const sel=page.locator('button,[role="combobox"]').filter({hasText:'Select a role'}).first();
  const n=await sel.count();
  let click='no';
  try { await sel.click({timeout:6000}); click='ok'; } catch(e){ click='FAIL '+String(e.message).slice(0,40); }
  await page.waitForTimeout(3500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const lists=[...document.querySelectorAll('[role="listbox"],[role="menu"],ul,[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>{const r=e.getBoundingClientRect();return {
        role:e.getAttribute('role')||e.tagName.toLowerCase(),
        w:Math.round(r.width),h:Math.round(r.height),
        opts:[...e.querySelectorAll('[role="option"],li,button')].filter(v)
          .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)).slice(0,10),
        text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120)};})
      .filter(x=>x.h>10);
    return {landedOn:window.__c, popups:lists.slice(0,4)};
  });
};
