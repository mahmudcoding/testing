import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const before={tabs:page.context().pages().length, url:page.url()};
  await page.keyboard.press('Meta+Enter');
  await page.waitForTimeout(4000);
  const ctx=page.context();
  const after={tabs:ctx.pages().length, url:page.url(),
    urls: ctx.pages().map(p=>p.url().replace(/https?:\/\/[^/]+/,'').replace(/m=[^&]+/,'m=<id>')).slice(0,4)};
  const dialogOpen = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog]')]
    .some(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}));
  return {before:{tabs:before.tabs, url:before.url.replace(/https?:\/\/[^/]+/,'')},
          after, dialogStillOpen:dialogOpen,
          currentPageNavigated: before.url!==after.url};
};
