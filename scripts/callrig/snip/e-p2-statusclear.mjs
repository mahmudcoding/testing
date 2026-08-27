import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Profile"]').first().click();
  await page.waitForTimeout(2500);
  const opts = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button,[role=menuitem]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>t && t.length<40).slice(0,16);
  });
  // a preset that is already set usually toggles off; otherwise look for a clear control
  const clear = opts.find(o=>/clear|убрать|снять|remove status|no status/i.test(o));
  let used=null;
  if (clear) { await page.locator('button').filter({hasText:new RegExp(clear.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).first().click(); used=clear; }
  else { const v=page.locator('button').filter({hasText:/Vacation/}).first();
         if(await v.count()){ await v.click(); used='toggled Vacation off'; } }
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  const after = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const b=await r.json();
    return {custom_status: JSON.stringify(b?.custom_status ?? b?.user?.custom_status ?? '(absent)')};
  });
  return {menuOptions:opts, actionUsed:used, after};
};
