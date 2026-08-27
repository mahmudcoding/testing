import {WS, BASE} from './e-p2-helpers.mjs';
const ids = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button,a,[role]')].filter(vis)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,44));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(ids);
  const btn = page.locator('[aria-label="Help & resources"]').first();
  const n = await btn.count();
  if(n) await btn.click();
  await page.waitForTimeout(3000);
  const after = await page.evaluate(ids);
  const b=new Set(before);
  const appeared=[...new Set(after.filter(x=>!b.has(x)))];
  const urlNow = await page.evaluate(()=>location.pathname+location.search);
  return {triggerFound:n>0, urlNow, appearedCount:appeared.length, appeared:appeared.slice(0,20)};
};
