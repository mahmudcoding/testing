export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/V4OTMTBKMTGKA9B?tab=logs',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {url:location.href,
      tabs:[...m.querySelectorAll('button')].map(b=>b.textContent.trim().slice(0,20)).filter(t=>/Recording|Chat|Logs/.test(t)),
      text: m.innerText.replace(/\n+/g,' | ').slice(0,1200)};
  });
};
