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
  const btn = page.locator('[aria-label="Profile"]').first();
  const n = await btn.count();
  if(!n) return {noProfileControl:true};
  await btn.click();
  await page.waitForTimeout(2500);
  const after = await page.evaluate(ids);
  const b=new Set(before);
  const appeared=[...new Set(after.filter(x=>!b.has(x)))];
  // close WITHOUT clicking anything inside
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  const closed = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=dialog],[role=menu]')].filter(vis).length;
  });
  return {appeared:appeared.slice(0,14), overlaysAfterEscape:closed};
};
