export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const out=[];
  for(let i=0;i<6;i++){
    const btns=await page.$$('main button');
    let hit=null;
    for(const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim();
      if(/^Unblock /.test(l)){ hit=b; out.push(l); break; } }
    if(!hit) break;
    await hit.click(); await page.waitForTimeout(2500);
  }
  return {unblocked: out};
};
