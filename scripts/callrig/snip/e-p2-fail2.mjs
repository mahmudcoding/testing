import {WS, BASE} from './e-p2-helpers.mjs';
const view = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {open:false};
  const t=d.innerText.replace(/\s+/g,' ');
  return {counts:(t.match(/All ?\d* Messages ?\d*/)||[''])[0],
    saysNoResults:/No results/i.test(t), saysError:/Search error/i.test(t),
    hasRetry:[...d.querySelectorAll('button')].filter(vis).some(e=>/^Retry$/i.test((e.textContent||'').trim())),
    tail:t.slice(t.indexOf('Files'), t.indexOf('Files')+150)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const attempted=[], failed=[];
  page.on('request', r=>{ if(/\/api\/v1\/search\?/.test(r.url())) attempted.push(1); });
  page.on('requestfailed', r=>{ if(/\/api\/v1\/search\?/.test(r.url())) failed.push(r.failure()?.errorText||'failed'); });
  await page.route('**/api/v1/search?**', r => r.abort('failed'));
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('zzq7 unique never searched',{delay:35});
  await page.waitForTimeout(8000);
  const aborted = await page.evaluate(view);
  // does Retry recover once the route is lifted?
  await page.unroute('**/api/v1/search?**');
  let recovered=null;
  if (aborted.hasRetry) {
    await page.locator('[role=dialog] button').filter({hasText:/^Retry$/}).first().click();
    await page.waitForTimeout(5000);
    recovered = await page.evaluate(view);
  }
  return {requestsAttempted:attempted.length, requestsFailed:failed, aborted, afterRetry:recovered};
};
