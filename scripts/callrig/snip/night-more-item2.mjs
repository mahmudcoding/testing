export default async ({page}) => {
  const tid=process.env.QA_ITEM;
  const snap=async()=>await page.evaluate(()=>({
    testids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].sort().join(','),
    dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].map(m=>(m.getAttribute('data-testid')||'')+':'+m.innerText.replace(/\n+/g,' ').slice(0,60)),
    bodyLen: document.body.innerText.length,
    hostWords:(document.body.innerText.match(/.{0,40}(co-host|transfer).{0,40}/gi)||[]).slice(0,4)
  }));
  const tb=await page.$('[data-testid="call-toolbar"]');
  const btns=await tb.$$('button');
  for (const b of btns){ const l=await b.getAttribute('aria-label')||''; if(/^More$/i.test(l)){ await b.click(); await page.waitForTimeout(1800); break; } }
  const before=await snap();
  await page.locator('[data-testid="'+tid+'"]').click();
  await page.waitForTimeout(5000);
  const after=await snap();
  const added=after.testids.split(',').filter(t=>!before.testids.split(',').includes(t));
  const removed=before.testids.split(',').filter(t=>!after.testids.split(',').includes(t));
  return {addedTestids:added, removedTestids:removed, dialogsAfter:after.dialogs, hostWordsAfter:after.hostWords, bodyLenDelta: after.bodyLen-before.bodyLen};
};
