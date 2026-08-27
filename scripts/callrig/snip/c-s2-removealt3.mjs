export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  out.addUsersCandidates=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/add (users|members|people)|invite/i.test(t));});
  if(out.addUsersCandidates.length){
    const lbl=out.addUsersCandidates[0];
    await page.locator('button').filter({hasText:new RegExp('^'+lbl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first()
      .click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(4000);
    out.addUsersDialog=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
      if(!d) return 'NO-DIALOG';
      return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,200),
        buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)))].slice(0,12)};});
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  }
  // sidebar context menu on the channel
  const side=page.locator('a[href*="/c/C4QCPRIVATE0001"]').first();
  await side.click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.sidebarMenu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"],[role="dialog"]')].filter(v)[0];
    return m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).filter(Boolean))].slice(0,12):'NO-MENU';});
  return out;
};
