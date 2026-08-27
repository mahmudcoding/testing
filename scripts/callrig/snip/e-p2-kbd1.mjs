import {WS, BASE} from './e-p2-helpers.mjs';
const sel = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {open:false};
  const rows=[...d.querySelectorAll('[role=option],[role=listbox] > *, [aria-selected]')].filter(vis);
  const marked=rows.map((e,i)=>({i, selAttr:e.getAttribute('aria-selected'),
      txt:(e.textContent||'').replace(/\s+/g,' ').replace(/^Open message /,'').slice(0,34)}))
    .filter(o=>o.selAttr!==null);
  return {open:true, nRows:rows.length,
    selectedIdx: marked.findIndex(o=>o.selAttr==='true'),
    selectedText: (marked.find(o=>o.selAttr==='true')||{}).txt || null,
    activeDescendant: (d.querySelector('[aria-activedescendant]')||{getAttribute:()=>null}).getAttribute('aria-activedescendant'),
    firstFew: marked.slice(0,4)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  const out={};
  out.afterType = await page.evaluate(sel);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  out.afterDown1 = await page.evaluate(sel);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  out.afterDown2 = await page.evaluate(sel);
  await page.keyboard.press('ArrowUp'); await page.waitForTimeout(700);
  out.afterUp = await page.evaluate(sel);
  const urlBefore = page.url();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  out.afterEscape = await page.evaluate(sel);
  out.urlUnchangedAfterEscape = (page.url()===urlBefore);
  return out;
};
