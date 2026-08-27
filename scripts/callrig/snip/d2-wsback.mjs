export default async ({ page }) => {
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1800); }
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
      .find(e=>/Switch to QA Workspace D/.test((e.getAttribute('aria-label')||e.innerText||'')));
    if(!el) return false; el.click(); return true;
  });
  await page.waitForTimeout(5000);
  const url = page.url();
  if (!/W4QDF1XTURESO01/.test(url)) {
    await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3500);
  }
  return { clicked, finalUrl: page.url().replace('https://airion-cargo.store',''),
    header: await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,110)) };
};
