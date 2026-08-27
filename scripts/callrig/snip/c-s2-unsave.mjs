export default async ({page}) => {
  const out={};
  const row = page.locator('[data-message-id]').last();
  await row.hover(); await page.waitForTimeout(800);
  out.hoverButtons = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean);
  });
  await row.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1300);
  out.menu = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const p=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="menu"]')].filter(vis).pop();
    return p? [...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean):null;
  });
  // try Unsave if present
  const un = page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Unsave$/});
  out.unsaveInMenu = await un.count();
  if (out.unsaveInMenu) {
    await un.last().click({timeout:8000}); await page.waitForTimeout(3000);
    out.afterUnsave = await page.evaluate(()=>({n:document.querySelectorAll('[data-message-id]').length}));
  }
  return out;
};
