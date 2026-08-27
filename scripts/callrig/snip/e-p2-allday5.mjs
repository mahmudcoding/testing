import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const dlg = page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill('QA-E allday probe');
  await dlg.getByText(/^All day$/).first().click();
  await page.waitForTimeout(1800);
  const reqs=[]; const h=r=>{const rq=r.request(); if(/\/api\/v1\//.test(rq.url()))
    reqs.push(rq.method()+' '+rq.url().replace(/https?:\/\/[^/]+/,'').slice(0,70)+' -> '+r.status()
      +(rq.method()==='POST'? ' BODY '+(rq.postData()||'').slice(0,240):''));};
  page.on('response',h);
  const btn = dlg.locator('button[type=submit]').last();
  const wasDisabled = await btn.isDisabled();
  await btn.click();
  await page.waitForTimeout(6000);
  page.off('response',h);
  const after = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {dialogStillOpen: !!d,
      text: d? d.innerText.replace(/\s+/g,' ').slice(0,300):null,
      errorish: d? /required|invalid|error|must|введите|обязат/i.test(d.innerText):null,
      toast:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,3)};
  });
  return {submitWasDisabled:wasDisabled, requests:reqs, after};
};
