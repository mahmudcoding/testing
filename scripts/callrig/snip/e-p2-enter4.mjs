import {WS, BASE} from './e-p2-helpers.mjs';
const state = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const h=d?d.querySelector('[aria-activedescendant]'):null;
  const id=h?h.getAttribute('aria-activedescendant'):null;
  const n=id?document.getElementById(id):null;
  return {dialogOpen:!!d, activeId:id,
    activeText:n?(n.textContent||'').replace(/\s+/g,' ').slice(0,34):null};
};
async function trial(page, switchTab, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  if (switchTab) { await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click(); await page.waitForTimeout(2500); }
  const before=await page.evaluate(state);
  const urlBefore=page.url();                      // FULL url, not pathname
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const after=await page.evaluate(state);
  const urlAfter=page.url();
  return {label, tabSwitched:!!switchTab, activeBefore:before, dialogOpenAfter:after.dialogOpen,
    urlChanged: urlAfter!==urlBefore,
    urlBefore:urlBefore.replace(/https?:\/\/[^/]+/,'').replace(/m=[^&]+/,'m=<id>'),
    urlAfter:urlAfter.replace(/https?:\/\/[^/]+/,'').replace(/m=[^&]+/,'m=<id>'),
    activated: (urlAfter!==urlBefore) || (before.dialogOpen && !after.dialogOpen)};
}
export default async ({page}) => ({
  allTab:  await trial(page,false,'All tab [control]'),
  msgsTab: await trial(page,true,'after Messages tab'),
  allTab2: await trial(page,false,'All tab again [control]'),
});
