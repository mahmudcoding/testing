import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4000);
  const order1 = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return [...d.querySelectorAll('button,a')].filter(vis).map(e=>(e.getAttribute('aria-label')||'').trim())
      .filter(x=>/^Message:/.test(x)).slice(0,6);
  });
  // open the sort control with a REAL click
  const sortBtn = page.locator('[role=dialog] button', {hasText:/^Relevance$/}).first();
  await sortBtn.click();
  await page.waitForTimeout(1500);
  const options = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...new Set([...document.querySelectorAll('[role=menuitem],[role=option],[role=menu] button,[data-radix-menu-content] button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<30))];
  });
  return {firstOrder:order1, sortOptions:options};
};
