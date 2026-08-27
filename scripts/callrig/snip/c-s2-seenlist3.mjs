export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001', id='M4OXEWL01S5558H';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const msg=page.locator(`[data-message-id="${id}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('[role="menuitem"]').filter({hasText:/^Seen by/}).first()
    .hover({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  const out={};
  out.menus=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menu"],[role="group"]')].filter(v)
      .map(m=>({label:m.getAttribute('aria-label')||'(none)',
        w:Math.round(m.getBoundingClientRect().width),
        rows:[...m.children].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,36))}));});
  // hover the viewer row inside the second menu
  const rows=page.locator('[role="menu"],[role="group"]').last().locator('> *');
  const n=await rows.count();
  out.rowCount=n;
  if(n){
    await rows.first().hover({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(3500);
    out.tooltip=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('[role="tooltip"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90));});
  }
  return out;
};
