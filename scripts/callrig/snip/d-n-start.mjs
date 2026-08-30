export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const sn = page.locator('button', {hasText:/^Start now$/}).first();
  out.found = await sn.count()>0;
  if(!out.found) return out;
  await sn.click();
  await page.waitForTimeout(3000);
  out.url1 = page.url();
  // a dialog may ask for name; capture then submit
  out.dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(d=>d.getBoundingClientRect().width>1);
    const d=ds[ds.length-1]; if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,15),
      testids:[...d.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,15)};
  });
  const sub = page.locator('[data-testid="calls-start-submit"]');
  if (await sub.count()>0) { await sub.first().click(); await page.waitForTimeout(6000); }
  out.url2 = page.url();
  await page.waitForTimeout(3000);
  out.url3 = page.url();
  return out;
};
