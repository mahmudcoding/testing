import {WS, BASE} from './e-p2-helpers.mjs';
const disp = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
  if(!d) return {open:false};
  const pressed=[...d.querySelectorAll('button')].filter(vis)
    .map(e=>({t:(e.textContent||'').trim().slice(0,14), checked:e.getAttribute('aria-checked'), pressed:e.getAttribute('aria-pressed')}))
    .filter(o=>o.checked==='true'||o.pressed==='true');
  return {open:true, selected:pressed,
    theme:document.documentElement.getAttribute('data-theme')||'(none)',
    fontVar:getComputedStyle(document.documentElement).getPropertyValue('--aloqa-font-scale')||'(n/a)'};
};
export default async ({page}) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('main').click({position:{x:5,y:5}}).catch(()=>{});
  await page.waitForTimeout(600);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(3500);
  let before = await page.evaluate(disp);
  if(!before.open){ await page.keyboard.press('Control+Shift+KeyT'); await page.waitForTimeout(3000); before = await page.evaluate(disp); }
  if(!before.open) return {before, note:'display settings did not open'};
  // change density to Compact
  const c = page.locator('[role=dialog] button').filter({hasText:/^Compact$/}).first();
  const has = await c.count();
  if(has) { await c.click(); await page.waitForTimeout(1500); }
  const afterChange = await page.evaluate(disp);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  await page.keyboard.press('Meta+Shift+KeyT'); await page.waitForTimeout(2500);
  const afterReload = await page.evaluate(disp);
  // restore to Cozy
  const cz = page.locator('[role=dialog] button').filter({hasText:/^Cozy$/}).first();
  if(await cz.count()) { await cz.click(); await page.waitForTimeout(1500); }
  const restored = await page.evaluate(disp);
  await page.keyboard.press('Escape');
  return {before, changedTo:has? 'Compact':'(control missing)', afterChange, afterReload, restored,
    persisted: JSON.stringify(afterChange.selected)===JSON.stringify(afterReload.selected)};
};
