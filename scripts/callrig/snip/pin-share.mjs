import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const inV = s => s.stats.flatMap(pc=>pc.in.filter(x=>x.kind==='video').map(x=>`${x.w}x${x.h}@${x.fps} dec=${x.framesDec}`));
  const before = inV(await page.evaluate('('+RTC_STATS+')()'));
  const btn = page.locator('button[aria-label="Pin QA Carol\'s screen"]').first();
  if (!(await btn.count())) return {err:'no pin button for carol screen'};
  await btn.click();
  await page.waitForTimeout(8000);
  const after = inV(await page.evaluate('('+RTC_STATS+')()'));
  const ui = await page.evaluate(() => {
    const surface = document.querySelector('[role="dialog"]') || document.body;
    return [...surface.querySelectorAll('video')].map(v=>{const r=v.getBoundingClientRect(); return {lbl:(v.closest('[aria-label]')||{}).getAttribute?.('aria-label'), w:Math.round(r.width), h:Math.round(r.height), vw:v.videoWidth, vh:v.videoHeight};});
  });
  return {before, after, ui};
};
