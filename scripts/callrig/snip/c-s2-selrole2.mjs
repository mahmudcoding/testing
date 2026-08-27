export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`);
  await page.waitForTimeout(9000);
  const steps={};
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500); steps.details='ok';
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(2500); steps.roles='ok';
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));},true);});
  await page.locator('button,[role="combobox"]').filter({hasText:'Select a role'}).first().click({timeout:6000});
  steps.selectRole='ok';
  await page.waitForTimeout(3500);
  const r = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const pops=[...document.querySelectorAll('[role="listbox"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>{const b=e.getBoundingClientRect();return {
        role:e.getAttribute('role')||'popper', w:Math.round(b.width), h:Math.round(b.height),
        optionCount:e.querySelectorAll('[role="option"],[role="menuitem"]').length,
        text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,140)};});
    return {landedOn:window.__c, popups:pops};
  });
  return {steps, ...r};
};
