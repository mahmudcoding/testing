export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const before = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button,a,[role=menuitem],[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' '));
  });
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  out.switcherFound = !!btn;
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(2200); }
  const after = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button,a,[role=menuitem],[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' '));
  });
  const b=new Set(before);
  out.newlyVisible = after.filter(x=>x && !b.has(x)).slice(0,14);
  out.popoverText = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis)[0];
    return p? (p.innerText||'').replace(/\s+/g,' ').slice(0,300):'(no popover element)';
  });
  return out;
};
