import { WS, VIS, SNAP, SHOTS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {};
  const dlgOpen = async () => await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="dialog"]')].filter(vis).some(x=>x.querySelector('[data-testid="calls-start-submit"]')); }, VIS);
  if (!(await dlgOpen())) {
    if (!/\/calls$/.test(await page.evaluate(()=>location.pathname))) {
      await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(4500);
    }
    const sn = page.locator('[data-testid="calls-hub-start-now"]').first();
    if (await sn.count()) { await sn.click(); await page.waitForTimeout(3000); }
  }
  const name = process.env.QA_CALLNAME || ('QA-A-NIGHT-' + Math.floor(Date.now()/1000%100000));
  const ti = page.locator('input[aria-label="Call name"]').first();
  if (await ti.count()) { await ti.fill(name); }
  await page.waitForTimeout(600);
  out.dlgText = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).find(x=>x.querySelector('[data-testid="calls-start-submit"]'));
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,500):null; }, VIS);
  const sub = page.locator('[data-testid="calls-start-submit"]').first();
  out.submitFound = await sub.count() > 0;
  if (!out.submitFound) return out;
  await sub.click();
  await page.waitForTimeout(10000);
  out.name = name;
  out.path = await page.evaluate(()=>location.pathname);
  return out;
}
