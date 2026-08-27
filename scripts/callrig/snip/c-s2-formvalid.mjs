export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OWNFC5WK5M1D6';
  const out={};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5200);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()){ await det.first().click(); await page.waitForTimeout(1300); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1000); }
  };
  await open();
  const inp=page.locator('input:visible').first();
  const ta=page.locator('textarea').first();
  const save=page.locator('button').filter({hasText:'Save'}).first();
  out.attrs = {
    inputMaxlength: await inp.evaluate(e=>e.getAttribute('maxlength')),
    taMaxlength: await ta.evaluate(e=>e.getAttribute('maxlength'))};
  const tryName=async(n)=>{
    await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
    await inp.fill('N'.repeat(n)); await page.waitForTimeout(500);
    const vLen=await inp.evaluate(e=>e.value.length);
    const dis=await save.evaluate(e=>e.disabled);
    const hint=await page.evaluate(()=>{
      const p=[...document.querySelectorAll('[role="tabpanel"]')].find(x=>x.getBoundingClientRect().height>4);
      return (p?p.innerText:'').replace(/\s+/g,' ').slice(0,150);});
    return {n, valueLen:vLen, saveDisabled:dis, hint};
  };
  out.name10 = await tryName(10);
  out.name80 = await tryName(80);
  out.name81 = await tryName(81);
  out.name300= await tryName(300);
  // restore name, then probe the topic field's Save state at 300 chars
  await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
  await inp.fill('QA C2 Verify Rename'); await page.waitForTimeout(400);
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
  await ta.fill('T'.repeat(300)); await page.waitForTimeout(500);
  out.topic300 = {valueLen: await ta.evaluate(e=>e.value.length),
    saveDisabled: await save.evaluate(e=>e.disabled),
    hint: await page.evaluate(()=>{
      const p=[...document.querySelectorAll('[role="tabpanel"]')].find(x=>x.getBoundingClientRect().height>4);
      return (p?p.innerText:'').replace(/\s+/g,' ').slice(0,150);})};
  return out;
};
