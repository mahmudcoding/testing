export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const close=page.locator('button[aria-label="Close channel details"]');
  if (await close.count()) { await close.first().click(); await page.waitForTimeout(400); }
  const msgs=page.locator('main [data-message-id]');
  out.msgCount=await msgs.count();
  const last=msgs.last();
  await last.scrollIntoViewIfNeeded(); await last.hover(); await page.waitForTimeout(500);
  out.msgButtons = await last.evaluate(el => [...el.querySelectorAll('button')]
    .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
    .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,26)));
  const more=last.locator('button[aria-label="More actions"]');
  out.hasMore=await more.count();
  if (out.hasMore) {
    await more.first().click({force:true}); await page.waitForTimeout(600);
    out.moreMenu = await page.evaluate(() => {
      const seen=new Set(), res=[];
      for (const e of document.querySelectorAll('[role="menuitem"],[role="menu"] [role="button"],[role="menu"] button')) {
        const r=e.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
        const t=e.textContent.trim().slice(0,40); if(t&&!seen.has(t)){seen.add(t);res.push(t);}
      }
      return res;
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }
  return out;
};
