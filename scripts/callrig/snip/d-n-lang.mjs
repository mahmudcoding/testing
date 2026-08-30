export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>({lang:document.documentElement.lang, vis:document.visibilityState,
    w:innerWidth, h:innerHeight,
    main:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200)}));
};
