export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCGENERAL0001');
  await page.waitForTimeout(9000);
  // open the profile menu (top bar) and sign out
  const btn=page.locator('button[aria-label="Profile"]').first();
  out.profileBtn=await btn.count();
  if(!out.profileBtn) return out;
  await btn.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(v)[0];
    return d?[...new Set([...d.querySelectorAll('button,a')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,10):'NO-MENU';});
  const so=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button,a')].filter(v)
      .find(b=>/^Sign out$/i.test((b.innerText||'').trim()))||null;});
  const el=so.asElement(); out.signOutFound=!!el;
  if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(8000);
  out.after=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return {meStatus:r.status, url:location.pathname.slice(0,30)};});
  return out;
};
