import {WS, BASE} from './e-p2-helpers.mjs';
const state = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const h=d?d.querySelector('[aria-activedescendant]'):null;
  return {open:!!d, id:h?h.getAttribute('aria-activedescendant'):null,
    options:d?[...d.querySelectorAll('[role=option]')].filter(vis).length:0};
};
async function trial(page, opener, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator(`button[aria-label="${opener}"]`).click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const before=await page.evaluate(state); const u0=page.url();
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const afterArrow=await page.evaluate(state);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const after=await page.evaluate(state); const u1=page.url();
  return {label, chipPreApplied: opener.includes('in channel'),
    options:before.options, arrowMoved: afterArrow.id!==before.id,
    enterActivated: (u1!==u0) || (before.open && !after.open)};
}
export default async ({page}) => ({
  global:   await trial(page,'Search QA Workspace E','global dialog, no chip [control]'),
  inChannel: await trial(page,'Search in channel','in-channel dialog, chip pre-applied'),
});
