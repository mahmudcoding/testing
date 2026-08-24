export default async ({page}) => {
  const before = await page.evaluate(()=>({top:(document.querySelector('[data-testid="call-top-bar"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,70)}));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>({url:location.href,
    top:(document.querySelector('[data-testid="call-top-bar"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,70),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,180)}));
  return {before, after};
};
