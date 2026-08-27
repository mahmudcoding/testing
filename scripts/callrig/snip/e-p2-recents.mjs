import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2500);
  const onOpen = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {noDialog:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,300),
      removeControls:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/recent/i.test(x)).slice(0,6),
      hasRecentWord:/recent|недавн/i.test(d.innerText)};
  });
  // reload and reopen — do recents survive?
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2500);
  const afterReload = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {noDialog:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,300),
      removeControls:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/recent/i.test(x)).slice(0,6)};
  });
  return {onOpen, afterReload};
};
