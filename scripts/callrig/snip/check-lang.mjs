export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(async()=>{
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {who: me.email, lang: document.documentElement.lang,
            sample: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,70)};
  });
};
