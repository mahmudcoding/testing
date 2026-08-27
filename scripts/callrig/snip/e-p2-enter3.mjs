import {WS, BASE} from './e-p2-helpers.mjs';
const active = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const h=d.querySelector('[aria-activedescendant]');
  return {id:h?h.getAttribute('aria-activedescendant'):null,
          options:[...d.querySelectorAll('[role=option]')].filter(vis).length};
};
async function trial(page, action, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600);
  const beforeAction = await page.evaluate(active);
  if (action==='sort') {
    await page.locator('[role=dialog] button').filter({hasText:/^(Relevance|Date|Alphabetical)$/}).first().click();
    await page.waitForTimeout(1200);
    await page.locator('[role=menu] button').filter({hasText:/^Date$/}).first().click();
    await page.waitForTimeout(3000);
  } else if (action==='range') {
    await page.locator('[role=dialog] button').filter({hasText:/^Last 30 days$/}).first().click();
    await page.waitForTimeout(3000);
  } else if (action==='tab') {
    await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
    await page.waitForTimeout(2500);
  }
  const afterAction = await page.evaluate(active);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const afterArrow = await page.evaluate(active);
  const before=new URL(page.url()).pathname;
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const url=await page.evaluate(()=>location.pathname);
  return {label, beforeAction, afterAction, afterArrow,
    arrowMoved: afterArrow.id!==afterAction.id, enterWorked:url!==before};
}
export default async ({page}) => ({
  sort:  await trial(page,'sort','changed sort to Date'),
  range: await trial(page,'range','changed range to Last 30 days'),
  tab:   await trial(page,'tab','switched to Messages tab [known]'),
  none:  await trial(page,'none','no control touched [control]'),
});
