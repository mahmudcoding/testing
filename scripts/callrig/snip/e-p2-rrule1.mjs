import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2800);
  const dlg=page.locator('[role=dialog]').last();
  const before = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {inputs:[...d.querySelectorAll('input,textarea,select')].filter(vis).length,
      repeatRow:(d.innerText.match(/Repeat[\s\S]{0,60}/)||[''])[0].replace(/\s+/g,' ')};
  });
  await dlg.getByText(/^Custom RRULE$/).first().click();
  await page.waitForTimeout(2200);
  const after = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {inputs:[...d.querySelectorAll('input,textarea,select')].filter(vis)
        .map(e=>({t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''), lbl:(e.getAttribute('aria-label')||e.placeholder||'').slice(0,34), v:(e.value||'').slice(0,40)})),
      repeatRow:(d.innerText.match(/Repeat[\s\S]{0,140}/)||[''])[0].replace(/\s+/g,' ')};
  });
  return {before, after};
};
