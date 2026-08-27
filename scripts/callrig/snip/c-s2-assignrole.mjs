export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const ch=await page.evaluate(()=>location.pathname.match(/\/c\/([A-Z0-9]+)/)[1]);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(4500);
  const out={channel:ch};
  // positive control for the Automatic role picker, now that a non-system role exists
  const auto=page.locator('button[aria-label="Automatic role"]').first();
  await auto.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1800);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.autoPicker=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=document.querySelector('button[aria-label="Automatic role"]');
    const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')][0];
    const r=lb?lb.getBoundingClientRect():null;
    return {expanded:b&&b.getAttribute('aria-expanded'),
      size:r?`${Math.round(r.width)}x${Math.round(r.height)}`:null,
      options:lb?[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
        .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)):null};});
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
