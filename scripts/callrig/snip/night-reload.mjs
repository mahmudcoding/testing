export default async ({page}) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(Number(process.env.QA_WAIT||12000));
  return {url:page.url().slice(-40),
    inCall: await page.evaluate(()=>!!document.querySelector('[data-testid="call-toolbar"]')),
    top: await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-top-bar"]');
      return t?t.innerText.replace(/\n+/g,' | ').slice(0,45):null;})};
};
