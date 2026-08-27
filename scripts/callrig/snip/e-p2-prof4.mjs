import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const reqs=[]; const h=async r=>{const rq=r.request();
    if(/\/api\/v1\//.test(rq.url()) && ['PATCH','PUT','POST'].includes(rq.method()))
      reqs.push(rq.method()+' '+rq.url().replace(/https?:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status()
        +' BODY '+(rq.postData()||'').slice(0,140));};
  page.on('response',h);
  // the position field currently holds "QA Engineer"
  const pos = page.locator('main input').nth(1);
  await pos.click();
  await pos.fill('QA Engineer zx9probe');
  await page.waitForTimeout(1200);
  const dirty = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return {buttons:[...m.querySelectorAll('button')].filter(vis)
      .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>/save|сохран|apply/i.test(t))};
  });
  if (dirty.buttons.length) {
    await page.locator('main button').filter({hasText:/save|сохран|apply/i}).first().click();
  } else {
    await page.keyboard.press('Tab');   // blur to trigger autosave
  }
  await page.waitForTimeout(5000);
  page.off('response',h);
  const finalVal = await page.evaluate(()=>[...document.querySelectorAll('main input')].map(e=>e.value).slice(0,3));
  return {saveButtons:dirty.buttons, requests:reqs, fieldValuesNow:finalVal};
};
