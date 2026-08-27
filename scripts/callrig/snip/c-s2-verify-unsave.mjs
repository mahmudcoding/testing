export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const menuOf=async(mid)=>{
    const el=page.locator(`main [data-message-id="${mid}"]`).first();
    if(!await el.count()) return {err:'not rendered'};
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const hover=await el.evaluate(e=>{
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...e.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean);});
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {hover, menu:'(none)'};
    await more.click(); await page.waitForTimeout(1500);
    const menu=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    return {hover, menu};
  };
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const mine=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-V2-OWNSAVE/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.msg=mine;
  if(mine) out.inChannelAfterSaving=await menuOf(mine);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  const copy=await page.evaluate(()=>{
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/QA-V2-OWNSAVE/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  if(copy) out.onSavedPage=await menuOf(copy);
  const inList=(o,x)=>o&&((Array.isArray(o.menu)&&o.menu.includes(x))||(Array.isArray(o.hover)&&o.hover.includes(x)));
  out.PASS = inList(out.inChannelAfterSaving,'Unsave') && !inList(out.onSavedPage,'Unsave')
             && inList(out.onSavedPage,'Delete');
  return out;
};
