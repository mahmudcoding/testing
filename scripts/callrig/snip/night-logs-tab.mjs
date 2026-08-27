export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/'+process.env.QA_CALL,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const tabs=await page.$$('[role="tab"]');
  for (const t of tabs){ const l=(await t.innerText()).trim(); if(/^Logs/i.test(l)){ await t.click(); break; } }
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>({
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,1200),
    rows:[...document.querySelectorAll('[data-testid*="log" i]')].map(e=>({t:e.getAttribute('data-testid'), txt:e.innerText.replace(/\n+/g,' | ').slice(0,90)})).slice(0,12)
  }));
};
