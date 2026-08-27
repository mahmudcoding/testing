export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
    const m=document.querySelector('main')||document.body;
    return {
      callButtons:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(x=>/call/i.test(x)),
      composer: !!document.querySelector('div[contenteditable="true"]')
    };
  });
};
