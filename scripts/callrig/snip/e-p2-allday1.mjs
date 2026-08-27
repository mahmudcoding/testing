import {WS, BASE} from './e-p2-helpers.mjs';
const formState = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
  if(!d) return {noDialog:true};
  const fields=[...d.querySelectorAll('input')].filter(vis).map(e=>({
    t:e.type, v:e.value, lbl:(e.getAttribute('aria-label')||'').slice(0,24),
    checked:e.type==='checkbox'?e.checked:null}));
  const allday=[...d.querySelectorAll('button,input,[role=switch],[role=checkbox]')].filter(vis)
    .map(e=>({tag:e.tagName, lbl:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,22),
      pressed:e.getAttribute('aria-pressed'), checked:e.getAttribute('aria-checked'), type:e.type||null}))
    .filter(o=>/all ?day/i.test(o.lbl));
  return {dateTimeFields: fields.filter(f=>['date','time'].includes(f.t)),
          allDayControl: allday, durationVisible:/Duration/.test(d.innerText)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const before = await page.evaluate(formState);
  // toggle All day with a REAL click
  const toggle = page.locator('[role=dialog]').last().locator('button,[role=switch],[role=checkbox],label')
    .filter({hasText:/All day/i}).first();
  const n = await toggle.count();
  if(n) await toggle.click();
  await page.waitForTimeout(2000);
  const after = await page.evaluate(formState);
  return {toggleFound:n>0, before, after};
};
