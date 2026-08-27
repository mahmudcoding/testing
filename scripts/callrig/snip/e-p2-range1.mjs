import {WS, BASE} from './e-p2-helpers.mjs';
const ranges = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {noDialog:true};
  return {chips:[...d.querySelectorAll('button')].filter(vis)
      .map(e=>({t:(e.textContent||'').trim(), pressed:e.getAttribute('aria-pressed')}))
      .filter(o=>/Last 7 days|Last 30 days|All time/.test(o.t)),
    sort:([...d.querySelectorAll('button')].filter(vis).map(e=>(e.textContent||'').trim())
      .find(t=>/^(Relevance|Date|Alphabetical)$/.test(t))||null),
    query:(d.querySelector('input')||{}).value};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const out={};
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40}); await page.waitForTimeout(3500);
  out.initial = await page.evaluate(ranges);
  await page.locator('[role=dialog] button').filter({hasText:/^Last 7 days$/}).first().click();
  await page.waitForTimeout(2500);
  out.afterSelect7 = await page.evaluate(ranges);
  // new query without closing
  await inp.fill(''); await page.waitForTimeout(500);
  await inp.type('seam',{delay:40}); await page.waitForTimeout(3500);
  out.afterNewQuery = await page.evaluate(ranges);
  // close and reopen
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp2=page.locator('[role=dialog] input').first();
  await inp2.click(); await inp2.type('probe',{delay:40}); await page.waitForTimeout(3500);
  out.afterReopen = await page.evaluate(ranges);
  return out;
};
