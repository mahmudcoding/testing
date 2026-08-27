export default async ({page}) => {
  const out=await page.evaluate(()=>{
    const keys=Object.keys(localStorage).filter(k=>/pin/i.test(k));
    return Object.fromEntries(keys.map(k=>[k,String(localStorage.getItem(k)).slice(0,140)]));});
  // restore: unpin via the sidebar menu
  const ch='C4QCPRIVATE0001';
  await page.locator(`a[href*="/c/${ch}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    if(!m) return null;
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^unpin$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement();
  let unpinned='no unpin item';
  if(el){ await el.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(4000); unpinned='clicked'; }
  const after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const keys=Object.keys(localStorage).filter(k=>/pin/i.test(k));
    return {ls:Object.fromEntries(keys.map(k=>[k,String(localStorage.getItem(k)).slice(0,90)])),
      order:[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
        .map(a=>(a.getAttribute('aria-label')||'').slice(0,26))};});
  return {localStorageWhilePinned:out, unpinAction:unpinned, afterUnpin:after};
};
