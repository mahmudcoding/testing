export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage(); const out={};
  try {
    await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    const snap = () => page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('button,a,li,[role]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    });
    const before = await snap();
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(x=>((x.getAttribute('aria-label')||x.innerText||'').trim())==='Language');
      if(b) b.click();
    });
    await page.waitForTimeout(2000);
    const after = await snap();
    const bs=new Set(before);
    out.newlyVisible = after.filter(x=>x && !bs.has(x)).slice(0,10);
    out.popover = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog],[role=listbox]')].filter(vis)[0];
      return p? (p.innerText||'').replace(/\s+/g,' ').slice(0,160):'(none)';
    });
  } finally { await ctx.close(); }
  return out;
};
