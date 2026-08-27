const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  const out={};
  await page.locator('button[aria-label="Start call"]').last().click({timeout:8000});
  await page.waitForTimeout(6000);
  out.inCall = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    return {url:location.href,
      buttons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean).slice(0,20)};
  });
  // hang up
  for (const sel of ['button[aria-label="End call"]','button[aria-label="Leave call"]','button[aria-label="Cancel call"]','button[aria-label="Hang up"]']) {
    try { await page.locator(sel).last().click({timeout:4000}); out.ended=sel; break; } catch(e){}
  }
  await page.waitForTimeout(2000);
  // confirm dialog if any
  try { await page.locator('[data-testid="call-end-confirm-submit"]').last().click({timeout:4000}); out.confirmed=true; } catch(e){}
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(()=>({url:location.href}));
  return out;
};
