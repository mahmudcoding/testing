import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(1500);
  const inp = page.locator('input:visible').first();
  await inp.fill('archive notification probe');
  await page.waitForTimeout(3500);
  const results = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const els=[...document.querySelectorAll('button,a,[role=option],[role=button]')].filter(vis);
    return {rows: els.map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,80)).filter(t=>t.length>3).slice(0,25)};
  });
  return results;
};
