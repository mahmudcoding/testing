import {WS, BASE} from './e-p2-helpers.mjs';
const view = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {open:false};
  const t=d.innerText.replace(/\s+/g,' ');
  return {open:true, counts:(t.match(/All ?\d* Messages ?\d*/)||[''])[0],
    saysNoResults:/No results/i.test(t),
    saysError:/(error|wrong|failed|try again|retry|ошибк|повтор)/i.test(t),
    hasRetry:[...d.querySelectorAll('button')].filter(vis).some(e=>/retry|try again|повтор/i.test(e.textContent||'')),
    body:t.slice(120,420)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  // 1) baseline, no interference
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  let inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4000);
  out.baseline = await page.evaluate(view);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  // 2) abort the search endpoint
  await page.route('**/api/v1/search?**', r => r.abort('failed'));
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(7000);
  out.aborted = await page.evaluate(view);
  // 3) 500 from the search endpoint
  await page.unroute('**/api/v1/search?**');
  await page.route('**/api/v1/search?**', r => r.fulfill({status:500, contentType:'application/json',
    body:JSON.stringify({code:500,key:"COMMON_INTERNAL",message:"boom",trace_id:"t"})}));
  await inp.fill(''); await page.waitForTimeout(600);
  await inp.type('probe2',{delay:40});
  await page.waitForTimeout(7000);
  out.http500 = await page.evaluate(view);
  await page.unroute('**/api/v1/search?**');
  return out;
};
