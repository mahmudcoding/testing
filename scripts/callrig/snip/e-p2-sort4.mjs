import {WS, BASE} from './e-p2-helpers.mjs';
const rows = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const all=[...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||'').trim());
  return {sort:(all.find(x=>/^(Relevance|Date|Alphabetical)$/.test(x))||'?'),
    msgs: all.filter(x=>/^Message:/.test(x)).map(x=>x.replace(/^Message: /,'').slice(0,42)).slice(0,8),
    counts:(d.innerText.replace(/\s+/g,' ').match(/All \d+ Messages \d+/)||[''])[0]};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
  await page.waitForTimeout(2500);
  const out={initial: await page.evaluate(rows)};
  for (const opt of ['Date','Alphabetical','Relevance']) {
    await page.locator('[role=dialog] button').filter({hasText:/^(Relevance|Date|Alphabetical)$/}).first().click();
    await page.waitForTimeout(1400);
    await page.locator('[role=menu] button').filter({hasText:new RegExp('^'+opt+'$')}).first().click();
    await page.waitForTimeout(3200);
    out[opt] = await page.evaluate(rows);
  }
  return out;
};
