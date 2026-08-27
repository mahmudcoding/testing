import {WS, BASE} from './e-p2-helpers.mjs';
async function trial(page, switchTo, label){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('seam-probe',{delay:45});
  await page.waitForTimeout(4500);
  if (switchTo) { await page.locator('[role=dialog] button').filter({hasText:switchTo}).first().click(); await page.waitForTimeout(2500); }
  const st=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const host=d.querySelector('[aria-activedescendant]');
    const id=host?host.getAttribute('aria-activedescendant'):null;
    const n=id?document.getElementById(id):null;
    const t=d.innerText.replace(/\s+/g,' ');
    return {activeId:id, activeText:n?(n.textContent||'').replace(/\s+/g,' ').slice(0,40):null,
      footerPromisesEnter:/↵ open/.test(t)};
  });
  const before=new URL(page.url()).pathname;
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const after=await page.evaluate(()=>location.pathname);
  return {label, tabSwitched:!!switchTo, state:st, before, after, enterWorked:after!==before};
}
export default async ({page}) => ({
  allTab:      await trial(page,null,'All tab (no tab switch) [control]'),
  messagesTab: await trial(page,/^Messages\d+$/,'after switching to Messages'),
  allTab2:     await trial(page,null,'All tab again [control]'),
});
