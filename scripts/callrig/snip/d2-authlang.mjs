export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage(); const out={};
  try {
    await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    out.controls = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('button,select,[role=combobox]')].filter(vis)
        .map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                  l:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)}));
    });
    const clicked = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button,[role=combobox]')].filter(vis)
        .find(x=>/Language|English/i.test((x.getAttribute('aria-label')||x.innerText||'')));
      if(!b) return false; b.click(); return true;
    });
    out.opened = clicked;
    await page.waitForTimeout(1600);
    out.options = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio]')].filter(vis)
        .map(o=>(o.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean);
    });
  } finally { await ctx.close(); }
  return out;
};
