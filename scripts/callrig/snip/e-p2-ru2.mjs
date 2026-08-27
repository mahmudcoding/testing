import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('main [aria-label="Language"]').first().click();
  await page.waitForTimeout(1800);
  const opts = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...new Set([...document.querySelectorAll('[role=menuitem],[role=option],[role=menu] button')].filter(vis)
      .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,8);
  });
  return {options:opts};
};
