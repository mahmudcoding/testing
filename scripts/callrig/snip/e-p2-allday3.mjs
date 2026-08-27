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
  const formNow = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return [...d.querySelectorAll('input')].filter(vis)
      .filter(e=>['date','time'].includes(e.type)).map(e=>`${e.type}:${e.getAttribute('aria-label')}=${e.value}`);
  });
  let posted=null;
  const h = async r => { const rq=r.request();
    if(rq.method()==='POST' && /\/calendar\/meetings$/.test(rq.url())) {
      let body=null; try{body=JSON.parse(rq.postData()||'{}')}catch{}
      let resp=null; try{resp=await r.json()}catch{}
      posted={status:r.status(), body, respKeys: resp?Object.keys(resp).slice(0,10):null,
        respStarts: resp?.starts_at||resp?.meeting?.starts_at||null,
        respEnds: resp?.ends_at||resp?.meeting?.ends_at||null,
        respAllDay: resp?.all_day ?? resp?.meeting?.all_day ?? 'ABSENT'};
    }};
  page.on('response',h);
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(5000);
  page.off('response',h);
  return {formFieldsWithAllDayOn: formNow, posted};
};
