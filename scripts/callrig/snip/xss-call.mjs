export default async ({page}) => {
  const payload = process.env.QA_PAYLOAD;
  const alerts=[];
  page.on('dialog', async d=>{ alerts.push('DIALOG:'+d.message().slice(0,60)); await d.dismiss().catch(()=>{}); });
  const errs=[];
  page.on('pageerror', e=>errs.push(String(e).slice(0,120)));
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(1200);
  await page.fill('#calls-hub-call-name', payload);
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(8000);
  const res = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    const h=ov?ov.querySelector('h2'):null;
    return {
      headingText: h? h.textContent.slice(0,120) : null,
      headingHTML: h? h.innerHTML.slice(0,200) : null,
      injectedTags: document.querySelectorAll('img[onerror], svg[onload], script[data-xss]').length,
      marker: !!window.__XSS_FIRED
    };
  });
  const api = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return j.meeting? j.meeting.name : null;});
  return {payload, res, apiName: api, alerts, errs};
};
