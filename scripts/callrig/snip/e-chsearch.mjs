export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  await page.locator('button[aria-label="Search in channel"]').first().click();
  await page.waitForTimeout(2200);
  out.opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    const scope=d||document.querySelector('main');
    return {isDialog:!!d, inputs:[...scope.querySelectorAll('input')].filter(vis).map(i=>i.placeholder||i.getAttribute('aria-label')),
      txt:scope.innerText.replace(/\n{2,}/g,' | ').slice(0,400)};
  });
  const inp = page.locator('[role=dialog] input, main input[placeholder*="earch"]').first();
  const run = async q => { await inp.fill(''); await page.waitForTimeout(300); await inp.fill(q); await page.waitForTimeout(2600);
    return await page.evaluate(()=>{const d=document.querySelector('[role=dialog]')||document.querySelector('main');
      return d.innerText.replace(/\n{2,}/g,' | ').slice(0,450);}); };
  out.q_probe = await run('probe');
  out.q_none  = await run('zzqqxx99');
  return out;
};
