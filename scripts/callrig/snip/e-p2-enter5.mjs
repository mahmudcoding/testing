import {WS, BASE} from './e-p2-helpers.mjs';
const state = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const h=d?d.querySelector('[aria-activedescendant]'):null;
  const id=h?h.getAttribute('aria-activedescendant'):null;
  const n=id?document.getElementById(id):null;
  return {open:!!d, id, txt:n?(n.textContent||'').replace(/\s+/g,' ').slice(0,30):null};
};
async function trial(page, action, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  if (action==='sort'){
    await page.locator('[role=dialog] button').filter({hasText:/^(Relevance|Date|Alphabetical)$/}).first().click();
    await page.waitForTimeout(1200);
    await page.locator('[role=menu] button').filter({hasText:/^Date$/}).first().click();
    await page.waitForTimeout(3000);
  } else if (action==='range'){
    await page.locator('[role=dialog] button').filter({hasText:/^Last 30 days$/}).first().click();
    await page.waitForTimeout(3000);
  }
  const before=await page.evaluate(state); const u0=page.url();
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const afterArrow=await page.evaluate(state);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const after=await page.evaluate(state); const u1=page.url();
  return {label, activeBefore:before.id, activeAfterArrow:afterArrow.id,
    arrowMoved: afterArrow.id!==before.id,
    enterActivated: (u1!==u0) || (before.open && !after.open)};
}
export default async ({page}) => ({
  none:  await trial(page,'none','nothing touched [control]'),
  sort:  await trial(page,'sort','after changing sort to Date'),
  range: await trial(page,'range','after changing range to Last 30 days'),
});
