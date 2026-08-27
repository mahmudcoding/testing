import { VIS, SNAP } from './a-nb-lib.mjs';
export default async ({page}) => {
  const name = process.env.QA_GNAME || 'Guest';
  const inp = page.locator('input').first();
  if (await inp.count()) { await inp.fill(name); await page.waitForTimeout(600); }
  const b = page.locator('button', {hasText:/Ask to join|Join/}).first();
  const st = {enabled: await b.count() ? !(await b.isDisabled()) : null};
  if (st.enabled) { await b.click(); await page.waitForTimeout(9000); }
  return {st, after: await page.evaluate(([v,s])=>eval('('+s+')')(v,null), [VIS, SNAP])};
}
