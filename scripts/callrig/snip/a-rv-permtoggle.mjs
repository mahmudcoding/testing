import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('request', r => { if (/\/admins\//.test(r.url())) out.reqs.push({m:r.method(), body:r.postData()}); });
  page.on('response', r => { if (/\/admins\//.test(r.url())) out.reqs.push({resp:r.status()}); });
  await page.evaluate(DOM);
  const want = process.env.QA_TICK;   // name of the checkbox to toggle
  const dlg = () => page.evaluate(() => {
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return { checked:[...d.querySelectorAll('input[type=checkbox]')].filter(i=>i.checked).map(i=>window.__qa.nameOf(i).replace(/\s+/g,' ').trim()) };
  });
  out.before = await dlg();
  const hit = await page.evaluate((w) => {
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop();
    const i=[...d.querySelectorAll('input[type=checkbox]')].find(x=>window.__qa.nameOf(x).trim()===w);
    if(!i) return null;
    const box = i.getBoundingClientRect().width>1 ? i : (i.closest('label')||i);
    box.scrollIntoView({block:'center'}); const r=box.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};
  }, want);
  out.hit = hit;
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(700); }
  out.afterTick = await dlg();
  await page.locator('[data-testid="admin-permissions-submit"]').first().click();
  await page.waitForTimeout(4000);
  return out;
};
