import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]').first();
  if (!(await t.count())) return {err:'no breakout button'};
  if ((await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(([v,s])=>eval('('+s+')')(v,'[data-testid="call-side-panel-slot"]'), [VIS,SNAP]);
}
