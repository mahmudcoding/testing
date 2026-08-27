import { WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${process.env.QA_CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(()=>({path:location.pathname,
    txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,180)}));
}
