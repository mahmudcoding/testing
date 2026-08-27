export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const card = page.locator('[data-testid="calls-scheduled-today"] li,[data-testid="calls-scheduled-today"] [role="listitem"]').filter({hasText:'QA-A-SCHED'}).first();
  const found = await card.count();
  const before = page.url();
  if (found) { await card.click({position:{x:120,y:14}}); await page.waitForTimeout(4000); }
  const after = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {url: location.href, dlg: d? d.innerText.replace(/\n+/g,' | ').slice(0,300):null, text: m.innerText.replace(/\n+/g,' | ').slice(0,260)};
  });
  return {found, before, after};
};
