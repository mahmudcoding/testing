export default async ({ page }) => {
  const out={};
  for (const path of ['/w/W4QAF1XTURESO01/search?q=V60-COPY','/w/W4QAF1XTURESO01/chat/search?q=V60-COPY']) {
    await page.goto('https://airion-cargo.store'+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
    out[path] = await page.evaluate(()=>({ url:location.pathname+location.search,
      mainTxt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,150),
      inputVals:[...document.querySelectorAll('input')].map(i=>i.value).filter(Boolean).slice(0,3) }));
  }
  return out;
};
