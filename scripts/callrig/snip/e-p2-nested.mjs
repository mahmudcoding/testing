import {WS, BASE} from './e-p2-helpers.mjs';
const layers = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  return {n:ds.length, top: ds.length? ds[ds.length-1].innerText.replace(/\s+/g,' ').slice(0,60):null};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const chip = page.locator('main button').filter({hasText:/standup/i}).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click();
  await page.waitForTimeout(4000);
  const l1 = await page.evaluate(layers);
  await page.locator('[role=dialog] [aria-label="Delete"]').first().click();
  await page.waitForTimeout(2500);
  const l2 = await page.evaluate(layers);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1800);
  const afterEsc1 = await page.evaluate(layers);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1800);
  const afterEsc2 = await page.evaluate(layers);
  return {cardOpen:l1, confirmOpen:l2, afterFirstEscape:afterEsc1, afterSecondEscape:afterEsc2,
    closedOneAtATime: l2.n===2 && afterEsc1.n===1 && afterEsc2.n===0};
};
