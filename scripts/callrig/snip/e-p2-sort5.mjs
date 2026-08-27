import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const beforeTab = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return {n:[...d.querySelectorAll('button,a')].filter(vis).length,
      labels:[...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)).slice(0,20)};
  });
  await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
  await page.waitForTimeout(3000);
  const afterTab = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return {n:[...d.querySelectorAll('button,a')].filter(vis).length,
      labels:[...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)).slice(0,20),
      bodyStart: d.innerText.replace(/\s+/g,' ').slice(150,420)};
  });
  return {beforeTab, afterTab};
};
