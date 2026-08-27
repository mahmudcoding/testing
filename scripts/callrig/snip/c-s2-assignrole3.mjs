export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXCK0OB50583Z';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(5000);
  const st=()=>page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Automatic role"]');
    const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')][0];
    const r=lb?lb.getBoundingClientRect():null;
    return {present:!!b, exp:b&&b.getAttribute('aria-expanded'),
      size:r?`${Math.round(r.width)}x${Math.round(r.height)}`:null,
      opts:lb?[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
        .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)):null};});
  const seq=[{step:'after Roles tab', ...(await st())}];
  const btn=page.locator('button[aria-label="Automatic role"]').first();
  for (let i=1;i<=3;i++){
    await btn.click({timeout:6000}).catch(e=>{});
    await page.waitForTimeout(2500);
    const s=await st(); seq.push({step:'click '+i, ...s});
    if(s.opts && s.opts.length) break;
  }
  return {sequence:seq};
};
