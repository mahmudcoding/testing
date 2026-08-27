const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const out={};
  // save someone else's message (the last one not authored by me)
  const target = page.locator('[data-message-id]').last();
  out.targetText = ((await target.innerText().catch(()=>''))||'').replace(/\n+/g,' | ').slice(0,70);
  await target.hover(); await page.waitForTimeout(800);
  await target.locator('button[aria-label="Save"]').first().click({timeout:10000});
  await page.waitForTimeout(2500);
  out.afterSave = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3),
      rowButtons:[...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean)};
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  out.savedPage = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('[data-message-id]')].map(e=>({
      id:e.getAttribute('data-message-id').slice(-6), text:e.innerText.replace(/\n+/g,' | ').slice(0,130),
      buttons:[...e.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)}));
    return {n:rows.length, rows:rows.slice(-3),
      mainHead:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,140)};
  });
  return out;
};
