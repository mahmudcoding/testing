export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/'+process.env.QA_CALL,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const tabs=await page.$$('[role="tab"]');
  for (const t of tabs){ const l=(await t.innerText()).trim(); if(/^Logs/i.test(l)){ await t.click(); break; } }
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const txt=(document.querySelector('main')||document.body).innerText;
    const lines=txt.split('\n').map(s=>s.trim()).filter(Boolean);
    // find where the entries start
    const i=lines.findIndex(l=>/^\d{1,2}:\d{2}:\d{2}/.test(l));
    return {entryLines: lines.slice(i, i+70), total: lines.length};
  });
};
