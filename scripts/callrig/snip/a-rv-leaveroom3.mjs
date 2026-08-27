import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const pos = await page.evaluate(() => {
    const b=[...document.querySelectorAll('button')].filter(window.__qa.vis).find(x=>/^Leave Side Room$/i.test(window.__qa.nameOf(x).trim()));
    if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
  });
  out.btn = pos; if(!pos) return out;
  await page.mouse.click(pos.x,pos.y); await page.waitForTimeout(2000);
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) { const p=await c.evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
    await page.mouse.click(p.x,p.y); out.confirmedAt = Date.now(); }
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  out.stillInRoom = await page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.vis).some(b=>/^Leave Side Room$/i.test(window.__qa.nameOf(b).trim())));
  return out;
};
