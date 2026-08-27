import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const hits=[...document.querySelectorAll('*')].filter(e=>vis(e)
      && /Switch to/.test(e.textContent||'') && e.children.length<=2);
    return hits.slice(0,4).map(e=>{
      const path=[]; let n=e;
      for(let i=0;i<4&&n;i++){ path.push(n.tagName.toLowerCase()+(n.getAttribute('role')?`[role=${n.getAttribute('role')}]`:'')); n=n.parentElement; }
      const r=e.getBoundingClientRect();
      return {tag:e.tagName, role:e.getAttribute('role'), label:e.getAttribute('aria-label'),
        text:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40),
        chain:path.join(' < '), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width)};
    });
  });
};
