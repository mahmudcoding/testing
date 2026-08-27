import {WS, BASE} from './e-p2-helpers.mjs';
async function tryTab(page, query, tabRe, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(query,{delay:45});
  await page.waitForTimeout(4500);
  const tab=page.locator('[role=dialog] button').filter({hasText:tabRe}).first();
  if(!(await tab.count())) return {label, tabMissing:true};
  await tab.click(); await page.waitForTimeout(2500);
  const st=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const host=d.querySelector('[aria-activedescendant]');
    return {activeId:host?host.getAttribute('aria-activedescendant'):null,
      options:[...d.querySelectorAll('[role=option]')].filter(vis).length};
  });
  const before=new URL(page.url()).pathname;
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const enterUrl=await page.evaluate(()=>location.pathname);
  let clickUrl=null;
  if(enterUrl===before){
    const opt=page.locator('[role=dialog] [role=option]').first();
    if(await opt.count()){ await opt.click(); await page.waitForTimeout(3000);
      clickUrl=await page.evaluate(()=>location.pathname); }
  }
  return {label, highlighted:st, urlBefore:before, afterEnter:enterUrl, enterWorked:enterUrl!==before,
    afterClick:clickUrl, clickWorked: clickUrl? clickUrl!==before : null};
}
export default async ({page}) => ({
  channels1: await tryTab(page,'search-control',/^Channels\d+$/,'Channels tab, run 1'),
  channels2: await tryTab(page,'search-control',/^Channels\d+$/,'Channels tab, run 2'),
  files:     await tryTab(page,'seam-probe',/^Files\d+$/,'Files tab'),
  messages:  await tryTab(page,'seam-probe',/^Messages\d+$/,'Messages tab [control]'),
});
