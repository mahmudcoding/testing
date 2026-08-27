import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const ctrls=[...d.querySelectorAll('button,input,select,[role=switch],[role=checkbox]')].filter(vis).map(e=>{
      const lbl=(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,30);
      const off = e.disabled===true || e.getAttribute('aria-disabled')==='true'
                  || /cursor-not-allowed/.test((e.className||'').toString());
      return {lbl: lbl||`(${e.type||e.tagName})`, off};
    }).filter(o=>o.lbl);
    return {disabled: ctrls.filter(c=>c.off).map(c=>c.lbl),
            enabledCount: ctrls.filter(c=>!c.off).length,
            total: ctrls.length};
  });
};
