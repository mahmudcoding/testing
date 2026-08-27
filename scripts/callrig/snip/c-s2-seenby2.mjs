export default async ({page}) => {
  const id='M4OXEWL01S5558H';
  const out={};
  const h=await page.evaluateHandle((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    if(!e) return null;
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
    return [...e.querySelectorAll('*')].filter(v)
      .find(x=>/^Seen by/i.test(x.getAttribute('aria-label')||''))||null;}, id);
  const el=h.asElement();
  out.found=!!el;
  if(!el) return out;
  await el.scrollIntoViewIfNeeded().catch(()=>{});
  await el.hover({timeout:6000}).catch(()=>{out.hoverFail=true});
  await page.waitForTimeout(3500);
  out.tooltip=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const tips=[...document.querySelectorAll('[role="tooltip"],[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,140)).filter(Boolean);
    return tips.slice(0,2);});
  // also try clicking it
  await el.click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(3000);
  out.afterClick=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {popups:[...document.querySelectorAll('[role="tooltip"],[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,140)).filter(Boolean).slice(0,2)};});
  return out;
};
