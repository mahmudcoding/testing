const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const resp=[];
  page.on('response', r=>{ if(/mute/.test(r.url())) resp.push({s:r.status(), m:r.request().method()}); });
  await page.locator('button[aria-label="Unmute notifications"]').last().click({timeout:10000});
  await page.waitForTimeout(1500);
  try { await page.locator('[data-radix-popper-content-wrapper] button, [role="dialog"] button').filter({hasText:/^Unmute$/}).last().click({timeout:8000}); } catch(e){}
  await page.waitForTimeout(3000);
  return {resp, state: await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>/mute/i.test(x.getAttribute('aria-label')||'')).pop();
    return {label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null};})};
};
