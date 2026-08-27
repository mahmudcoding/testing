import {WS, BASE} from './e-p2-helpers.mjs';
const act = () => {
  const e=document.activeElement;
  return e? {tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)} : null;
};
async function trial(page, sel, name){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const op=page.locator(sel).first();
  if(!(await op.count())) return {name, openerMissing:true};
  const openerLabel = await op.getAttribute('aria-label');
  await op.click(); await page.waitForTimeout(2500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1800);
  const afterEsc = await page.evaluate(act);
  await page.keyboard.press('Tab'); await page.waitForTimeout(700);
  const nextTab = await page.evaluate(act);
  return {name, opener:openerLabel, afterEscape:afterEsc, nextTabStop:nextTab,
    thrownToTop: !!nextTab && /Skip to content/i.test(nextTab.label||'')};
}
export default async ({page}) => ({
  search:   await trial(page,'[aria-label="Search QA Workspace E"]','global search'),
  bell:     await trial(page,'[aria-label^="Notifications"]','notifications panel'),
  archived: await trial(page,'[aria-label="Open archived channels"]','archived channels'),
});
