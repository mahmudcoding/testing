export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const t = await page.evaluate(() => {
    const m = document.querySelector('main');
    return {lang: document.documentElement.lang, txt: (m?m.innerText:'').replace(/\n+/g,' | ').slice(0,400)};
  });
  return t;
}
