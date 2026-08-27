import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count()) {
    const pressed = await t.getAttribute('aria-pressed');
    if (pressed !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  }
  return await page.evaluate(([v,s])=>eval('('+s+')')(v,'[data-testid="call-side-panel-slot"]'), [VIS,SNAP]);
}
