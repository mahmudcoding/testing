export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCGENERAL0001');
  await page.waitForTimeout(9000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return page.evaluate(()=>({
    parked:true, url:location.pathname.slice(-16),
    msgs:document.querySelectorAll('main [data-message-id]').length,
    heapMB: performance.memory ? +(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,
    domNodes: document.getElementsByTagName('*').length,
    visibility: document.visibilityState }));
};
