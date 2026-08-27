const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6500);
  const out={};
  // find the parent that has the thread, open it
  const parent = page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last();
  await parent.scrollIntoViewIfNeeded().catch(()=>{});
  await parent.hover(); await page.waitForTimeout(800);
  await parent.locator('button[aria-label="Reply"]').first().click({timeout:10000}).catch(async()=>{
    await page.locator('[data-message-id]').filter({hasText:'QA-S2-QMD parent'}).last().click();
  });
  await page.waitForTimeout(4000);
  out.thread = await page.evaluate(async ()=>{
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const q=msgs.filter(m=>/QA-S2-QMD-QUOTING/.test(m.innerText||'')).pop();
    const orig=msgs.filter(m=>/QA-S2-QMD \*\*bold\*\*/.test(m.innerText||'')).pop();
    return {url:location.href,
      quotingText: q? q.innerText.replace(/\n+/g,' | ').slice(0,200):null,
      originalText: orig? orig.innerText.replace(/\n+/g,' | ').slice(0,120):null};
  });
  return out;
};
