export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,110));
  out.before=await ls();
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,26));},true);});
  const btn=page.locator('button[aria-label="Mute notifications"]').first();
  out.btnCount=await btn.count();
  await btn.click({timeout:6000}).catch(e=>{out.clickErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.landed=await page.evaluate(()=>window.__c);
  out.afterClick1=await ls();
  // maybe it opens a menu with mute options
  out.menuAfter=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).filter(Boolean).slice(0,8):'no menu';});
  return out;
};
