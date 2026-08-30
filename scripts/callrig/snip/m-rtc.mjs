import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const fn = await page.evaluate(`(${RTC_STATS})()`).catch(e=>({err:String(e)}));
  return fn;
};
