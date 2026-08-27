import { WS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>location.pathname);
};
