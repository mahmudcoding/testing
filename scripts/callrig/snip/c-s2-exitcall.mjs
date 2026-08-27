const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  const out={};
  out.start = page.url();
  // click leave if present
  for (const sel of ['button[aria-label="Leave call"]','button[aria-label="End call"]']) {
    try { await page.locator(sel).last().click({timeout:4000}); out.left=sel; break; } catch(e){}
  }
  await page.waitForTimeout(1500);
  try { await page.locator('[data-testid="call-end-confirm-submit"]').last().click({timeout:3000}); out.confirmed=true; } catch(e){}
  await page.waitForTimeout(3000);
  await page.goto('about:blank',{waitUntil:'load'}); await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  out.end = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
    return {url:location.href, current:(await r.text()).slice(0,120),
      msgNodes:document.querySelectorAll('[data-message-id]').length};
  });
  return out;
};
