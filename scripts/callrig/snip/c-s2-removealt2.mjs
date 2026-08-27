export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(10000);
  // 1. Add users dialog
  try {
    await page.locator('button[aria-label="Add users"], button:has-text("Add users")').first().click({timeout:6000});
    await page.waitForTimeout(4000);
    out.addUsersDialog=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
      if(!d) return 'NO-DIALOG';
      return {text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,220),
        buttons:[...new Set([...d.querySelectorAll('button')].filter(v)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)))].slice(0,14)};});
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  } catch(e){ out.addUsersDialog='click failed'; }
  // 2. profile card via the members list
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Members/}).first().click({timeout:6000});
  await page.waitForTimeout(4000);
  const before=await page.evaluate(()=>document.querySelectorAll('[role="dialog"]').length);
  await page.locator("button[aria-label=\"Open QA Bob's profile\"]").first().click({timeout:6000});
  await page.waitForTimeout(4500);
  out.profile=await page.evaluate((before)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(v);
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.65&&b.width>250&&b.height>250;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return {dialogsBefore:before, dialogsNow:ds.length,
      dialogText: ds[0]?(ds[0].innerText||'').replace(/\s+/g,' ').trim().slice(0,180):null,
      rightPane: pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,180):'NO-PANE'};
  }, before);
  return out;
};
