import {WS, BASE} from './e-p2-helpers.mjs';
async function attempt(page, dayOffset, allDay, label){
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill(`QA-E allday ${label}`);
  if (dayOffset!==0) {
    const d=await page.evaluate((off)=>{const x=new Date();x.setDate(x.getDate()+off);return x.toLocaleDateString('en-CA');},dayOffset);
    await dlg.locator('input[aria-label="Starts date"]').fill(d);
    await page.waitForTimeout(900);
    const ends=dlg.locator('input[aria-label="Ends date"]');
    if(await ends.count()) { await ends.fill(d); await page.waitForTimeout(600); }
  }
  if (allDay) { await dlg.getByText(/^All day$/).first().click(); await page.waitForTimeout(1800); }
  const reqs=[]; const h=r=>{const rq=r.request();
    if(rq.method()==='POST'&&/\/calendar\/meetings/.test(rq.url()))
      reqs.push({status:r.status(), body:(rq.postData()||'').slice(0,300)});};
  page.on('response',h);
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(6000);
  page.off('response',h);
  const after=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    return {stillOpen:!!d, msg: d? (d.innerText.match(/[A-Z][^.]*must[^.]*|[A-Z][^.]*required[^.]*/)||[''])[0]:'',
      toast:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
  });
  return {label, allDay, dayOffset, posted:reqs, after};
}
export default async ({page}) => ({
  A_allday_today:    await attempt(page,0,true,'today'),
  B_allday_tomorrow: await attempt(page,1,true,'tomorrow'),
  C_timed_today:     await attempt(page,0,false,'timed-today [control]'),
});
