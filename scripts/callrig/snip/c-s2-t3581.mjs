export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const det=page.locator('button[aria-label="Channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1200); }
  out.aboutControls=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const p=[...document.querySelectorAll('[role="tabpanel"]')].find(vis)||document.body;
    return [...p.querySelectorAll('button')].filter(vis)
      .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26));});
  out.deleteInDetails=out.aboutControls.some(l=>/delete|удал/i.test(l||''));
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // sidebar context menu
  await page.locator(`a[href="/w/${ws}/c/${ch}"]`).first().click({button:'right'});
  await page.waitForTimeout(1200);
  out.sidebarMenu=await page.evaluate(()=>{
    const m=document.querySelector('[role="menu"]');
    return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12):'no menu';});
  await page.keyboard.press('Escape');
  return out;
};
