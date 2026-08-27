const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const out={};
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000});
  await page.waitForTimeout(4000);
  const state = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const q=msgs.filter(m=>/QA-S2-QMD-QUOTING/.test(m.innerText||'')).pop();
    const orig=msgs.filter(m=>/QMD \*\*bold\*\*|QMD \\\*\\\*bold/.test(m.innerText||'')).pop();
    return {tag, quoting: q? q.innerText.replace(/\n+/g,' | ').slice(0,190):null,
      quotingButtons: q? [...q.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean):[],
      origPresent: !!orig, origText: orig? orig.innerText.replace(/\n+/g,' | ').slice(0,90):null};
  }, t);
  out.before = await state('before-delete');
  // delete the quoted original
  const target = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD **bold**'}).last();
  await target.scrollIntoViewIfNeeded().catch(()=>{});
  await target.hover(); await page.waitForTimeout(800);
  await target.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(1500);
  out.confirmDialog = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return d? d.innerText.replace(/\n+/g,' | ').slice(0,160):null;
  });
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Delete$/}).last().click({timeout:8000});
  await page.waitForTimeout(4000);
  out.after = await state('after-delete');
  return out;
};
