export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(3000); }
  await page.waitForTimeout(2000);
  const b = page.locator('[data-testid="breakout-rooms-panel"] button', {hasText:/^Join$/}).first();
  if (!(await b.count())) return {err:'no join', panel: await page.evaluate(()=>{const s=document.querySelector('[data-testid="breakout-rooms-panel"]'); return s? s.innerText.replace(/\n+/g,' | ').slice(0,300):'none';})};
  await b.click({timeout: 15000});
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>({tabs:(document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,140),
    surface:(document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,200)}));
};
