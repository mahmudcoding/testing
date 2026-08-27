import {WS, BASE} from './e-p2-helpers.mjs';
const ids = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button,a,[role]')].filter(vis)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(ids);
  const btn = page.locator('button[aria-label="Open workspace menu"]').first();
  const exp1 = await btn.getAttribute('aria-expanded');
  await btn.click();
  await page.waitForTimeout(3000);
  const exp2 = await btn.getAttribute('aria-expanded').catch(()=>'(gone)');
  const after = await page.evaluate(ids);
  const b=new Set(before);
  return {ariaExpandedBefore:exp1, ariaExpandedAfter:exp2,
    appeared:[...new Set(after.filter(x=>!b.has(x)))].slice(0,15),
    appearedCount:new Set(after.filter(x=>!b.has(x))).size};
};
