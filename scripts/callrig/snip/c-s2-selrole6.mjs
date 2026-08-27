export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=document.querySelector('button[aria-label="Automatic role"]');
    const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v)[0];
    return {expanded:b&&b.getAttribute('aria-expanded'),
      opts: lb?[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
        .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,32)):null,
      lbText: lb?(lb.innerText||'').replace(/\s+/g,' ').trim().slice(0,90):null};});
  const open=async(settle)=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(9000);
    await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
    await page.waitForTimeout(2500);
    await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
    await page.waitForTimeout(settle);
    const btn=page.locator('button[aria-label="Automatic role"]').first();
    await btn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
    const first=await st();
    await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
    const second=await st();
    return {first,second};
  };
  return {settle2500:await open(2500), settle10000:await open(10000)};
};
