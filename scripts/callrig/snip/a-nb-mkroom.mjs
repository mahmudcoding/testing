import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page}) => {
  const name = process.env.QA_ROOM || 'Room A';
  const out = {};
  await page.locator('[data-testid="side-rooms-new"]').first().click();
  await page.waitForTimeout(2200);
  out.dialog = await page.evaluate(([v,s])=>eval('('+s+')')(v,null), [VIS,SNAP]);
  return out;
}
