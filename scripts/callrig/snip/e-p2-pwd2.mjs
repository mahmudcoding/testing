import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill('QA-E pwd probe');
  await dlg.getByText(/^Password$/).first().click();
  await page.waitForTimeout(1500);
  await dlg.locator('input[type=password]').first().fill('probe-pw-1234');
  await page.waitForTimeout(800);
  const shown = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const p=[...d.querySelectorAll('input[type=password]')].filter(vis)[0];
    return {passwordFieldValueLength: p? p.value.length : null,
      startDate:(d.querySelector('input[aria-label="Starts date"]')||{}).value};
  });
  let post=null;
  const h=r=>{const rq=r.request(); if(rq.method()==='POST'&&/\/calendar\/meetings/.test(rq.url())){
    let b=null; try{b=JSON.parse(rq.postData()||'{}')}catch{}
    post={status:r.status(), keys:Object.keys(b||{}),
      hasPasswordKey: Object.keys(b||{}).some(k=>/pass|pwd|secret/i.test(k)),
      passwordEchoed: JSON.stringify(b||{}).includes('probe-pw-1234')};
  }};
  page.on('response',h);
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(6000);
  page.off('response',h);
  const after=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return {dialogOpen: !!([...document.querySelectorAll('[role=dialog]')].filter(vis).pop()),
      toast:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
  });
  return {shown, post, after};
};
