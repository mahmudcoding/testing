import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const trigger = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/member/i.test(x)).slice(0,4);
  });
  if(!trigger.length) return {noMembersTrigger:true};
  await page.locator(`[aria-label="${trigger[0]}"]`).first().click();
  await page.waitForTimeout(3500);
  const panel = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    // find the container listing member profile buttons
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/^Open .*'s profile$/.test(e.getAttribute('aria-label')||''));
    if(!btns.length) return {opened:false};
    let box=btns[0]; for(let i=0;i<8&&box;i++){ if([...box.querySelectorAll('button')].filter(e=>/^Open .*'s profile$/.test(e.getAttribute('aria-label')||'')).length>=3) break; box=box.parentElement; }
    const t=box.innerText.replace(/\s+/g,' ');
    return {opened:true, memberButtons:btns.length,
      mentionsVacation:/Vacation|🌴/i.test(t),
      anyStatusEmoji:/[🌴🤒🚇🏠🍔👤]/.test(t),
      text:t.slice(0,220)};
  });
  return {triggerUsed:trigger[0], panel};
};
