import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1800);
  await page.locator('input[placeholder*="Type :in"]').fill('archive notification probe');
  await page.waitForTimeout(4000);
  const listed = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!dlg) return {noDialog:true};
    const rows=[...dlg.querySelectorAll('button,a,[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>t.length>2);
    return {text: dlg.innerText.replace(/\s+/g,' ').slice(0,600), rows: rows.slice(0,20)};
  });
  return listed;
};
