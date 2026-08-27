import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page}) => {
  const b = page.locator('button[aria-label^="Admit all"]').first();
  const found = await b.count() > 0;
  if (found) { await b.click(); await page.waitForTimeout(6000); }
  return {found, panel: await page.evaluate(([v,s])=>eval('('+s+')')(v,'[data-testid="call-side-panel-slot"]'), [VIS,SNAP])};
}
