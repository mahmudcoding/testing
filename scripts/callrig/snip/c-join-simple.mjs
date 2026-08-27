export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const CALL=process.env.QA_CALL;
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.locator('button', {hasText:/^Join$/}).last();
  if (await j.count()) { await j.click(); }
  await page.waitForTimeout(9000);
  return await page.evaluate(async ()=>{
    let cur=null; try{cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    return {inCall: !!(cur&&cur.meeting), url:location.pathname,
      toolbar:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(-20)};
  });
};
