export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>[...document.querySelectorAll('[data-testid="ic-user-message"]')]
    .map(r=>(r.innerText||'').replace(/\s+/g,' ').slice(0,110)));
};
