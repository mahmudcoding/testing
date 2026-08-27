export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1600); }
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
      .find(e=>((e.getAttribute('aria-label')||e.innerText||'').trim())==='Create workspace');
    if(el) el.click();
  });
  await page.waitForTimeout(3000);
  // open the "Create in" selector
  const opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,[role=combobox]')].filter(vis)
      .find(e=>/Create in/.test((e.getAttribute('aria-label')||e.innerText||'')));
    if(!el) return false; el.click(); return true;
  });
  out.selectorOpened = opened;
  await page.waitForTimeout(1800);
  out.options = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio]')].filter(vis)
      .map(o=>({t:(o.innerText||'').trim().replace(/\s+/g,' ').slice(0,40),
                dis:o.getAttribute('aria-disabled')||o.getAttribute('data-disabled')||''}));
  });
  // close without creating
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  out.dialogClosed = await page.evaluate(()=>!document.querySelector('[role=dialog]'));
  return out;
};
