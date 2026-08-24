export default async ({page}) => {
  const out = [];
  const snap = async (tag) => { await page.waitForTimeout(900); return await page.evaluate((tag) => {
    const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    const submit=[...d.querySelectorAll('button')].find(b=>/^Schedule meeting$/.test(b.textContent.trim()));
    const summary=[...d.querySelectorAll('*')].filter(e=>e.children.length===0 && /·/.test(e.textContent) && /min|hr|AM|PM/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,70));
    return {tag, submitDisabled: submit?submit.disabled:null,
      starts: (d.querySelector('input[aria-label="Starts time"]')||{}).value, startsD:(d.querySelector('input[aria-label="Starts date"]')||{}).value,
      ends: (d.querySelector('input[aria-label="Ends time"]')||{}).value, endsD:(d.querySelector('input[aria-label="Ends date"]')||{}).value,
      summary,
      errs: [...d.querySelectorAll('[aria-invalid="true"],[role="alert"]')].map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,80)).filter(Boolean)};
  }, tag); };
  await page.fill('[role="dialog"] input[aria-label="Add title"]', 'QA Sched Validate');
  out.push(await snap('baseline'));
  // Ends before Starts
  await page.fill('[role="dialog"] input[aria-label="Ends time"]', '13:00');
  out.push(await snap('ends-before-starts'));
  // Ends on an earlier date
  await page.fill('[role="dialog"] input[aria-label="Ends date"]', '2026-08-23');
  out.push(await snap('ends-prev-day'));
  // restore
  await page.fill('[role="dialog"] input[aria-label="Ends date"]', '2026-08-24');
  await page.fill('[role="dialog"] input[aria-label="Ends time"]', '15:00');
  out.push(await snap('restored'));
  // start in the past
  await page.fill('[role="dialog"] input[aria-label="Starts date"]', '2020-01-01');
  out.push(await snap('start-in-past'));
  await page.fill('[role="dialog"] input[aria-label="Starts date"]', '2026-08-24');
  out.push(await snap('restored2'));
  return out;
};
