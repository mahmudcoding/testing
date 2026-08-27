// Enumerate: message "More actions" menu items + composer attach menu items.
export default async ({page}) => {
  const out = {url: page.url(), vis: await page.evaluate(()=>document.visibilityState)};
  const msgs = page.locator('main [data-message-id]');
  out.msgCount = await msgs.count();
  if (!out.msgCount) return out;
  const last = msgs.last();
  await last.scrollIntoViewIfNeeded();
  await last.hover();
  await page.waitForTimeout(400);
  // hover toolbar buttons
  out.hoverToolbar = await page.evaluate(() => {
    const btns=[...document.querySelectorAll('main button')].filter(b=>{
      const r=b.getBoundingClientRect(); return r.width>0&&r.height>0;
    });
    return btns.map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,30)).filter(Boolean).slice(-14);
  });
  const more = last.locator('button[aria-label="More actions"]');
  if (await more.count()) {
    await more.first().click();
    await page.waitForTimeout(500);
    out.moreMenu = await page.evaluate(() => {
      const items=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button,[data-radix-menu-content] *')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&e.children.length===0;});
      return [...new Set(items.map(e=>e.textContent.trim()).filter(Boolean))].slice(0,30);
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  return out;
};
