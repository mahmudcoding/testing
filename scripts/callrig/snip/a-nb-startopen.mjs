import { WS, VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out={};
  if (!/\/calls$/.test(await page.evaluate(()=>location.pathname))) {
    await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
  }
  const sn = page.locator('[data-testid="calls-hub-start-now"]').first();
  if (await sn.count()) { await sn.click(); await page.waitForTimeout(3000); }
  const name = process.env.QA_CALLNAME || 'QA-A-OPEN';
  const ti = page.locator('input[aria-label="Call name"]').first();
  if (await ti.count()) await ti.fill(name);
  // choose the "Open" access mode
  out.picked = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const els=[...d.querySelectorAll('button,[role="radio"],[role="option"],label')].filter(vis);
    const b=els.find(x=>/^Open$/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no Open option', have:els.map(x=>(x.textContent||'').trim().slice(0,24)).slice(0,20)};
    b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(1200);
  const sub = page.locator('[data-testid="calls-start-submit"]').first();
  if (!(await sub.count())) { out.err='no submit'; return out; }
  await sub.click(); await page.waitForTimeout(10000);
  out.name=name; out.path = await page.evaluate(()=>location.pathname);
  return out;
};
