import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4000);
  await page.locator('[role=dialog] button').filter({hasText:/^Relevance$/}).first().click();
  await page.waitForTimeout(1800);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    // find any visible element whose own text is exactly Date / Alphabetical
    const hits=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /^(Date|Alphabetical|Relevance)$/.test((e.textContent||'').trim()));
    return hits.map(e=>{
      const path=[]; let n=e;
      for(let i=0;i<4&&n;i++){ path.push(n.tagName.toLowerCase()+(n.getAttribute('role')?`[role=${n.getAttribute('role')}]`:'')); n=n.parentElement; }
      return {text:e.textContent.trim(), chain:path.join(' < '),
        clickableAncestorRole: (e.closest('[role]')||{getAttribute:()=>null}).getAttribute('role')};
    });
  });
};
