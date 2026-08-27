const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const out={};
  const row = page.locator('[data-message-id]').filter({hasText:'QA-S2-REACT-TARGET'}).last();
  await row.scrollIntoViewIfNeeded().catch(()=>{});
  await row.hover(); await page.waitForTimeout(700);
  await row.locator('button[aria-label^="View "]').first().click({timeout:10000});
  await page.waitForTimeout(2200);
  const dlg=(t)=>page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? {tag, text:d.innerText.replace(/\n+/g,' | ').slice(0,260),
      tabs:[...d.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22), sel:b.getAttribute('aria-selected')})),
      rows:(d.innerText.match(/QA [A-Za-z]+/g)||[])}:null;
  }, t);
  out.opened = await dlg('opened');
  // switch to the other emoji tab if present
  const tabs = page.locator('[role="dialog"] [role="tab"]');
  out.tabCount = await tabs.count();
  if (out.tabCount > 1) { await tabs.nth(1).click({timeout:8000}); await page.waitForTimeout(1500); out.secondTab = await dlg('second-tab'); }
  return out;
};
