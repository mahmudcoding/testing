import {WS, BASE} from './e-p2-helpers.mjs';
const act = () => {
  const e=document.activeElement;
  return e? {tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)} : null;
};
async function trial(page, openerLabel, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const op = page.locator(`[aria-label="${openerLabel}"]`).first();
  if(!(await op.count())) return {label, openerMissing:true};
  await op.click();
  await page.waitForTimeout(2500);
  const inside = await page.evaluate(act);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1800);
  const after = await page.evaluate(act);
  return {label, opener:openerLabel, focusInside:inside, focusAfterEscape:after,
    returnedToOpener: !!after && (after.label===openerLabel || (after.label||'').includes(openerLabel.slice(0,12)))};
}
export default async ({page}) => ({
  search:   await trial(page,'Search QA Workspace E','global search dialog'),
  bell:     await trial(page,'Notifications, 7 unread','notifications panel'),
  archived: await trial(page,'Open archived channels','archived channels panel'),
});
