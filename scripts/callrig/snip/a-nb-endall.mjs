import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out={};
  await page.mouse.move(600,400); await page.waitForTimeout(500);
  const b = page.locator('button[aria-label="End for everyone"]').first();
  out.found = await b.count();
  if (out.found) { await b.click(); await page.waitForTimeout(1500); }
  const c = page.locator('[data-testid="call-end-confirm-submit"]').first();
  out.confirm = await c.count();
  if (out.confirm) { await c.click(); }
  await page.waitForTimeout(6000);
  out.path = await page.evaluate(()=>location.pathname);
  out.txt = await page.evaluate((v)=>{const vis=eval(v);
    return (document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,160);}, VIS);
  return out;
};
