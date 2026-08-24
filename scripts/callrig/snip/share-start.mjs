import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const btn = page.locator('[data-testid="call-controls-screen-share"]');
  if (!(await btn.count())) return {err:'no share button'};
  const st0 = await page.evaluate(() => ({label: document.querySelector('[data-testid="call-controls-screen-share"]').getAttribute('aria-label'), dis: document.querySelector('[data-testid="call-controls-screen-share"]').disabled}));
  await btn.click();
  await page.waitForTimeout(6000);
  const st1 = await page.evaluate(() => ({
    label: (document.querySelector('[data-testid="call-controls-screen-share"]')||{}).getAttribute?.('aria-label'),
    gdm: (window.__gdmCalls||[]).length,
    surface: (document.querySelector('[role="dialog"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean)
  }));
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  return {st0, st1, outTracks: rtc.stats.map(pc=>pc.out.map(o=>`${o.kind} ${o.w}x${o.h}@${o.fps}`))};
};
