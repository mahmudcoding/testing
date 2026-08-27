import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Help & resources"], a[aria-label="Help & resources"]').first().click();
  await page.waitForTimeout(2800);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    // do not filter to role=dialog
    const cands=[...document.querySelectorAll('[role=dialog],[role=menu],aside,section')].filter(vis)
      .filter(e=>e.innerText && e.innerText.length>20 && e.innerText.length<1500);
    const d=cands.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!d) return {found:false};
    return {found:true, tag:d.tagName, role:d.getAttribute('role'),
      text:d.innerText.replace(/\s+/g,' ').slice(0,420),
      links:[...d.querySelectorAll('a[href]')].filter(vis).map(e=>({t:(e.textContent||'').trim().slice(0,26), href:(e.getAttribute('href')||'').slice(0,50)})),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)).filter(Boolean)};
  });
};
