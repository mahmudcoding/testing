import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2800);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill('QA-E allday evidence');
  await dlg.getByText(/^All day$/).first().click();
  await page.waitForTimeout(1600);
  const posts=[]; const h=r=>{const rq=r.request(); if(rq.method()==='POST'&&/\/calendar\/meetings/.test(rq.url())) posts.push(r.status());};
  page.on('response',h);
  const atSubmit = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const now=new Date();
    return {clockLocal:now.toTimeString().slice(0,5), dateLocal:now.toLocaleDateString('en-CA'),
      startDate:(d.querySelector('input[aria-label="Starts date"]')||{}).value,
      startTime:([...d.querySelectorAll('input[type=time]')].filter(vis)[0]||{}).value,
      endsDateField: !!d.querySelector('input[aria-label="Ends date"]'),
      whenRow:(d.innerText.match(/When[\s\S]{0,30}/)||[''])[0].replace(/\s+/g,' ')};
  });
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(5000);
  page.off('response',h);
  const res=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return {dialogOpen: !!([...document.querySelectorAll('[role=dialog]')].filter(vis).pop()),
      error:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean)[0]||null};
  });
  return {atSubmit, postsSent:posts.length, result:res};
};
