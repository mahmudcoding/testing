export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  await page.locator('button').filter({hasText:/members/i}).first().click();
  await page.waitForTimeout(2500);
  const names=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
    if(!d) return 'no dialog';
    const t=(d.innerText||'').replace(/\s+/g,' ');
    return {order:(t.match(/QA [A-Z][a-z]+/g)||[]), head:t.slice(0,60)};});
  out.initial=await names();
  // search
  const inp=page.locator('[role="dialog"] input:visible').first();
  out.hasSearch=await inp.count();
  if(out.hasSearch){
    await inp.fill('bob'); await page.waitForTimeout(1800);
    out.searchBob=await names();
    await inp.fill(''); await page.waitForTimeout(1500);
    out.afterClear=await names();
    await inp.fill('zzzznomatch'); await page.waitForTimeout(1800);
    out.searchNone=await names();
    await inp.fill(''); await page.waitForTimeout(1200);
  }
  // sort
  const sort=page.locator('[role="dialog"] button').filter({hasText:/Sort|Recently joined/}).first();
  out.hasSort=await sort.count();
  if(out.hasSort){
    await sort.click(); await page.waitForTimeout(1500);
    out.sortMenu=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,8):'no menu';});
    // pick a different option if there is one
    const opt=page.locator('[role="menu"] *').filter({hasText:/^(Name|A–Z|A-Z|Alphabetical|Joined)/}).first();
    if(await opt.count()){ await opt.click(); await page.waitForTimeout(2000); out.afterSort=await names(); }
    else await page.keyboard.press('Escape');
  }
  await page.keyboard.press('Escape');
  return out;
};
