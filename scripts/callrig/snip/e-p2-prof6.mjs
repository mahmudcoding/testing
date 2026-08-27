import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const pos = page.locator('main input').nth(1);
  await pos.click(); await pos.fill('QA Engineer');
  await page.waitForTimeout(1000);
  let saved=null;
  const h=async r=>{const rq=r.request(); if(/auth\/me\/settings/.test(rq.url())&&rq.method()==='PUT'){
    let b=null; try{b=JSON.parse(rq.postData()||'{}')}catch{}
    saved={status:r.status(), jobTitle:b?.profile?.jobTitle, department:b?.profile?.department};}};
  page.on('response',h);
  await page.locator('main button').filter({hasText:/Save profile/i}).first().click();
  await page.waitForTimeout(4000);
  page.off('response',h);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(4500);
  const after = await page.evaluate(()=>[...document.querySelectorAll('main input')].map(e=>e.value).slice(0,3));
  return {saved, fieldsAfterReload:after,
    restored: after[1]==='QA Engineer' && after[0]==='QA Alice' && after[2]==='Quality'};
};
