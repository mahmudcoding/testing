export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2800);
  out.panel = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]')||document.querySelector('[role=menu]');
    if(!d) return {none:true};
    return {txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,800),
      btns:[...d.querySelectorAll('button,[role=tab],a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean).slice(0,22)};
  });
  return out;
};
