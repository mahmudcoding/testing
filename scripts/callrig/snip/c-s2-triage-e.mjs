export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX7EH5R4J2J6M';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // find the Leave channel control the way a person would
  const details=page.locator('button[aria-label="Channel details"]').first();
  out.detailsFound=await details.count();
  if(out.detailsFound){ await details.click(); await page.waitForTimeout(2500); }
  out.panelControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()||b.getAttribute('aria-label'))
      .filter(t=>t&&/leave|archive|delete/i.test(t)).slice(0,6);});
  const leave=page.locator('button').filter({hasText:/^Leave channel$/}).first();
  out.leaveFound=await leave.count();
  if(out.leaveFound){
    await leave.click(); await page.waitForTimeout(2000);
    out.confirm=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
        .filter(x=>/leave/i.test(x.innerText||''))
        .sort((a,b)=>a.getBoundingClientRect().height-b.getBoundingClientRect().height)[0];
      return d? {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,140),
        buttons:[...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.innerText||'').trim()).filter(Boolean)}:null;});
    const go=page.locator('[role="dialog"] button, [role="alertdialog"] button')
      .filter({hasText:/^Leave( channel)?$/}).last();
    if(await go.count()){ await go.click(); await page.waitForTimeout(4500); }
    out.afterLeave=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {url:location.pathname.slice(-20),
        toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,110)))],
        inline:[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
          .map(e=>(e.textContent||'').trim())
          .filter(t=>/error|failed|could not|last member|archive|delete/i.test(t)))].slice(0,5)};});
  }
  return out;
};
