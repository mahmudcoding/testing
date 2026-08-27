import {WS, BASE} from './e-p2-helpers.mjs';
const disp = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  // anchor on the panel's OWN control, not on a role
  const reset=[...document.querySelectorAll('button')].filter(vis)
    .find(e=>/^Reset all$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
  if(!reset) return {open:false};
  let box=reset; for(let i=0;i<8&&box;i++){ if(box.querySelectorAll('button').length>=6) break; box=box.parentElement; }
  const sel=[...box.querySelectorAll('button')].filter(vis)
    .map(e=>({t:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,16),
              checked:e.getAttribute('aria-checked'), pressed:e.getAttribute('aria-pressed')}))
    .filter(o=>o.checked==='true'||o.pressed==='true');
  return {open:true, selected:sel, tag:box.tagName, role:box.getAttribute('role')||'(none)'};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.keyboard.press('Meta+Shift+KeyT'); await page.waitForTimeout(3000);
  const before = await page.evaluate(disp);
  if(!before.open) return {before, note:'panel still not found'};
  const c = page.locator('button').filter({hasText:/^Compact$/}).first();
  const has = await c.count();
  if(has) { await c.click(); await page.waitForTimeout(1500); }
  const afterChange = await page.evaluate(disp);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  await page.keyboard.press('Meta+Shift+KeyT'); await page.waitForTimeout(3000);
  const afterReload = await page.evaluate(disp);
  const cz = page.locator('button').filter({hasText:/^Cozy$/}).first();
  if(await cz.count()) { await cz.click(); await page.waitForTimeout(1500); }
  const restored = await page.evaluate(disp);
  await page.keyboard.press('Escape');
  return {before, changed:has>0, afterChange, afterReload, restored,
    persisted: JSON.stringify(afterChange.selected)===JSON.stringify(afterReload.selected)};
};
