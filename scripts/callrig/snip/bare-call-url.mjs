export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/V4OTMTBKMTGKA9B',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>({url:location.href,
    selectedTab: [...document.querySelectorAll('main button')].filter(b=>b.getAttribute('aria-selected')==='true').map(b=>b.textContent.trim().slice(0,20)),
    text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300)}));
};
