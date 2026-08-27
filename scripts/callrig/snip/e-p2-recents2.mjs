import {WS, BASE} from './e-p2-helpers.mjs';
const recents = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return {noDialog:true};
  const t=d.innerText.replace(/\s+/g,' ');
  const m=t.match(/RECENT SEARCHES (.*?)(?:↑↓|$)/);
  return {list: m? m[1].trim().split(/\s+/).filter(Boolean).slice(0,12) : [],
    removeCount:[...d.querySelectorAll('button')].filter(vis)
      .filter(e=>/Remove from recent/i.test(e.getAttribute('aria-label')||'')).length};
};
export default async ({page}) => {
  const out={};
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2500);
  out.before = await page.evaluate(recents);
  // add a new distinctive query and see whether it lands at the top
  const inp=page.locator('[role=dialog] input').first();
  await inp.click(); await inp.type('zzrecent1',{delay:40});
  await page.waitForTimeout(4000);
  await inp.fill(''); await page.waitForTimeout(1500);
  out.afterNewQuery = await page.evaluate(recents);
  // remove the first entry
  const rm = page.locator('[role=dialog] [aria-label="Remove from recent searches"]').first();
  const n = await rm.count();
  if(n){ await rm.click(); await page.waitForTimeout(1500); }
  out.afterRemove = await page.evaluate(recents);
  // does the removal survive a reload?
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2500);
  out.afterReload = await page.evaluate(recents);
  return out;
};
