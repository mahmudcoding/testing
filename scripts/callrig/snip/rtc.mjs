import { RTC_STATS } from './lib.mjs';
export default async ({page}) => await page.evaluate('('+RTC_STATS+')()');
