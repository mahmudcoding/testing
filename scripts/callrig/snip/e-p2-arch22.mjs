import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.type('e-arch', {delay:40});
  await page.waitForTimeout(3500);
  // switch to the Channels tab, then enumerate the row and its controls
  const before = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const tab=[...dlg.querySelectorAll('button,[role=tab]')].filter(vis).find(e=>/^Channels\d/.test((e.textContent||'').replace(/\s+/g,'')));
    if(tab) tab.click();
    return {clickedTab: !!tab};
  });
  await page.waitForTimeout(2000);
  const rows = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=dlg.innerText.replace(/\s+/g,' ');
    return {panel: t.slice(0,420),
      controls: [...dlg.querySelectorAll('button,a,[role=option]')].filter(vis)
        .map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)}))
        .filter(o=>o.l.length>1)};
  });
  return {before, rows};
};
