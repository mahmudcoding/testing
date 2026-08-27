import {WS, BASE} from './e-p2-helpers.mjs';
const active = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  const h=d.querySelector('[aria-activedescendant]');
  const id=h?h.getAttribute('aria-activedescendant'):null;
  const n=id?document.getElementById(id):null;
  return {id, txt:n?(n.textContent||'').replace(/\s+/g,' ').slice(0,34):null,
          options:[...d.querySelectorAll('[role=option]')].filter(vis).length};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const seq=[{step:'All tab, typed', ...(await page.evaluate(active))}];
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600);
  seq.push({step:'All tab, ArrowDown', ...(await page.evaluate(active))});
  await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
  await page.waitForTimeout(2500);
  seq.push({step:'after Messages tab', ...(await page.evaluate(active))});
  for (const k of ['ArrowDown','ArrowDown','ArrowUp']) {
    await page.keyboard.press(k); await page.waitForTimeout(600);
    seq.push({step:'Messages tab, '+k, ...(await page.evaluate(active))});
  }
  const before=new URL(page.url()).pathname;
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const after=await page.evaluate(()=>location.pathname);
  return {seq, enterAfterArrows:{before, after, worked:after!==before}};
};
