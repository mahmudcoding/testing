import {WS, BASE} from './e-p2-helpers.mjs';
const sel = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {open:false};
  const host=d.querySelector('[aria-activedescendant]');
  const id=host? host.getAttribute('aria-activedescendant') : null;
  const node=id? document.getElementById(id) : null;
  return {open:true, activeId:id,
    activeText: node? (node.textContent||'').replace(/\s+/g,' ').replace(/^Open message /,'').slice(0,40) : null,
    activeExists: !!node,
    activeVisible: node? vis(node) : null};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const seq=[{step:'typed', ...(await page.evaluate(sel))}];
  for (const k of ['ArrowDown','ArrowDown','ArrowDown','ArrowUp']) {
    await page.keyboard.press(k); await page.waitForTimeout(650);
    seq.push({step:k, ...(await page.evaluate(sel))});
  }
  // Enter opens the highlighted result
  const before=page.url();
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const after=page.url();
  const closed=await page.evaluate(()=>![...document.querySelectorAll('[role=dialog]')]
    .some(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}));
  return {seq, enter:{urlBefore:before.replace(/https?:\/\/[^/]+/,''), urlAfter:after.replace(/https?:\/\/[^/]+/,''),
    navigated: before!==after, dialogClosed:closed}};
};
