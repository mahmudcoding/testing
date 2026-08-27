export default async ({page}) => {
  const out={};
  const trig=page.locator('[role="menu"] [role="menuitem"]').filter({hasText:/^Seen by/}).first();
  out.triggerFound=await trig.count();
  if(!out.triggerFound) return out;
  await trig.click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(3000);
  out.expanded=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const t=[...document.querySelectorAll('[role="menuitem"]')].filter(v)
      .find(e=>/^Seen by/.test((e.innerText||'').trim()));
    return t?t.getAttribute('aria-expanded'):null;});
  out.list=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const l=[...document.querySelectorAll('[role="menu"],[role="group"]')].filter(v)
      .find(e=>/seen/i.test(e.getAttribute('aria-label')||''));
    if(!l) return 'NO-LIST';
    return {label:l.getAttribute('aria-label'),
      rows:[...l.children].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,40))};});
  // hover the first viewer row for the tooltip
  const row=page.locator('[role="menu"] [role="menuitem"], [role="group"] > *').filter({hasText:/QA /}).last();
  if(await row.count()){
    await row.hover({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(3500);
    out.tooltip=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('[role="tooltip"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80));});
  }
  return out;
};
