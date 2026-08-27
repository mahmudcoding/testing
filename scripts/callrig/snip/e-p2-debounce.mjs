import {WS, BASE} from './e-p2-helpers.mjs';
async function run(page, text, delay){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const reqs=[]; const h=r=>{const u=r.url(); if(/\/api\/v1\/search\?/.test(u))
    reqs.push(decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '));};
  page.on('request',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(text,{delay});
  await page.waitForTimeout(6000);
  page.off('request',h);
  return {typed:text, keystrokes:text.length, delayMs:delay,
    requests:reqs.length, queries:reqs};
}
export default async ({page}) => ({
  fast: await run(page,'notification',15),
  slow: await run(page,'notification',260),
});
