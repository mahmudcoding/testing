export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  await page.locator(`a[href*="/d/${dm}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return {dmMenu: m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean))]:'NO-MENU'};});
};
