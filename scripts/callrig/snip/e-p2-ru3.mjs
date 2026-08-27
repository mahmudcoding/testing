import {WS, BASE} from './e-p2-helpers.mjs';
const ids = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button,a,[role],option,li')].filter(vis)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,34));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const el = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const e=[...document.querySelectorAll('[aria-label="Language"]')].filter(vis)[0];
    if(!e) return null;
    return {tag:e.tagName, role:e.getAttribute('role'), type:e.type||null,
      expanded:e.getAttribute('aria-expanded'), text:(e.textContent||'').trim().slice(0,30),
      isSelect:e.tagName==='SELECT',
      options: e.tagName==='SELECT'? [...e.options].map(o=>o.text+'='+o.value) : null};
  });
  const before = await page.evaluate(ids);
  await page.locator('main [aria-label="Language"]').first().click();
  await page.waitForTimeout(2500);
  const after = await page.evaluate(ids);
  const b=new Set(before);
  return {control:el, appeared:[...new Set(after.filter(x=>!b.has(x)))].slice(0,12)};
};
