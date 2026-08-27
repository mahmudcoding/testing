import {WS, BASE} from './e-p2-helpers.mjs';
const focus = () => {
  const e=document.activeElement;
  if(!e) return null;
  return {tag:e.tagName, type:e.type||null,
    label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26),
    isSearchInput: e.tagName==='INPUT' && !!e.getAttribute('aria-activedescendant'),
    hasActiveDescendant: !!e.getAttribute('aria-activedescendant')};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const out={afterTyping: await page.evaluate(focus)};
  await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
  await page.waitForTimeout(2500);
  out.afterTabClick = await page.evaluate(focus);
  // does restoring focus to the input revive the keyboard?
  await page.locator('[role=dialog] input').first().click();
  await page.waitForTimeout(1200);
  out.afterRefocus = await page.evaluate(focus);
  const st = () => { const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const h=d?d.querySelector('[aria-activedescendant]'):null;
    return {open:!!d, id:h?h.getAttribute('aria-activedescendant'):null}; };
  const b=await page.evaluate(st); const u0=page.url();
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const a=await page.evaluate(st);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const after=await page.evaluate(st); const u1=page.url();
  out.afterRefocusKeyboard={arrowMoved:a.id!==b.id, enterActivated:(u1!==u0)||(b.open&&!after.open)};
  return out;
};
