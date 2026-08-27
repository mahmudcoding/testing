import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const before = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const pw=[...d.querySelectorAll('*')].filter(e=>vis(e)&&/^Password$/i.test((e.textContent||'').trim()));
    return {passwordLabels:pw.length,
      whoCanJoin:(d.innerText.match(/WHO CAN JOIN[\s\S]{0,180}/)||[''])[0].replace(/\s+/g,' '),
      inputTypes:[...d.querySelectorAll('input')].filter(vis).map(e=>e.type)};
  });
  // click the Password row
  const pw = page.locator('[role=dialog]').last().getByText(/^Password$/).first();
  const n = await pw.count();
  if(n) await pw.click();
  await page.waitForTimeout(2000);
  const after = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {inputs:[...d.querySelectorAll('input')].filter(vis)
        .map(e=>({t:e.type, lbl:(e.getAttribute('aria-label')||e.placeholder||'').slice(0,30), v:e.value.slice(0,20)})),
      whoCanJoin:(d.innerText.match(/WHO CAN JOIN[\s\S]{0,200}/)||[''])[0].replace(/\s+/g,' ')};
  });
  return {passwordControlFound:n>0, before, after};
};
