export default async ({page}) => {
  const ws='W4QCF1XTURESO01', A='C4QCGENERAL0001', B='C4QCPRIVATE0001';
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const text = () => page.evaluate(()=>{const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return c?c.innerText.replace(/\n+$/,''):'NO-COMPOSER';});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`,{waitUntil:'load'});
  await page.waitForTimeout(3800);
  await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await comp().type('QA-C-DRAFT-UNSENT');
  await page.waitForTimeout(800);
  const typed = await text();
  // navigate away and back (SPA navigation via sidebar link)
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${B}`,{waitUntil:'load'});
  await page.waitForTimeout(3200);
  const otherChannel = await text();
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${A}`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const backAfterNav = await text();
  // full reload
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(4000);
  const afterReload = await text();
  // sidebar draft marker?
  const marker = await page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-general/.test(x.innerText));
    return a?(a.getAttribute('aria-label')||'')+' | '+a.innerText.replace(/\s+/g,' ').trim():'ABSENT';});
  return {typed, otherChannel, backAfterNav, afterReload, sidebarEntry: marker};
};
