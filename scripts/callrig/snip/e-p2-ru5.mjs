import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('main [aria-label="Language"]').first().click();
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const hits=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && (e.textContent||'').trim()==='Russian');
    return hits.map(e=>{
      const path=[]; let n=e;
      for(let i=0;i<4&&n;i++){ path.push(n.tagName.toLowerCase()+(n.getAttribute('role')?`[role=${n.getAttribute('role')}]`:'')); n=n.parentElement; }
      const c=e.closest('button,[role=menuitem],[role=option],li,div[data-value]');
      return {chain:path.join(' < '), clickableTag:c?c.tagName:null, clickableRole:c?c.getAttribute('role'):null,
        dataValue:c?c.getAttribute('data-value'):null};
    });
  });
};
