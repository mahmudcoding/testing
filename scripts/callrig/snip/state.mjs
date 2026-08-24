import { UI_STATE, RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const ui = await page.evaluate('('+UI_STATE+')()');
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  const api = await page.evaluate(async () => {
    const g = async p => { const r = await fetch(p,{credentials:'include'}); return {s:r.status, b:(await r.text()).slice(0,700)}; };
    return {current: await g('/api/v1/meetings/current'), active: await g('/api/v1/workspace/W4QAF1XTURESO01/meetings/active')};
  });
  return {ui, rtc, api};
};
