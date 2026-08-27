import {WS, BASE} from './e-p2-helpers.mjs';
const state = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const m=document.querySelector('main')||document.body;
  const t=m.innerText.replace(/\s+/g,' ');
  const inp=[...m.querySelectorAll('input')].filter(vis)[0];
  return {url:location.pathname+location.search,
    inputValue: inp? inp.value : null,
    counts:(t.match(/All \d+|Showing \d+ results?/)||[''])[0],
    head:t.slice(0,140)};
};
export default async ({page}) => {
  const out={};
  // reach full search the way a user does
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:45});
  await page.waitForTimeout(4000);
  await page.locator('[role=dialog] button').filter({hasText:/^Open full search$/}).first().click();
  await page.waitForTimeout(5000);
  out.afterOpenFullSearch = await page.evaluate(state);
  const url = page.url();
  // A) reload
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  out.afterReload = await page.evaluate(state);
  // B) cold open of the same URL in a fresh navigation
  await page.goto(`${BASE}/w/${WS}/directories`, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000);
  await page.goto(url, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  out.afterColdOpen = await page.evaluate(state);
  return out;
};
