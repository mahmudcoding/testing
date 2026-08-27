import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const b=page.locator('[data-testid="call-controls-screen-share"]');
  const before={label: await b.getAttribute('aria-label'), pressed: await b.getAttribute('aria-pressed')};
  await b.click();
  await page.waitForTimeout(8000);
  const after={label: await b.getAttribute('aria-label').catch(()=>null), pressed: await b.getAttribute('aria-pressed').catch(()=>null)};
  const r=await page.evaluate('('+RTC_STATS+')()');
  const outV=[]; for(const pc of r.stats) for(const o of pc.out) if(o.kind==='video') outV.push({w:o.w,h:o.h,bytes:o.bytes});
  const gdm=await page.evaluate(()=>(window.__gdmCalls||[]).length);
  return {before, after, outboundVideoTracks: outV, getDisplayMediaCalls: gdm};
};
