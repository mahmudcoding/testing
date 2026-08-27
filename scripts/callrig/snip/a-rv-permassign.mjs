import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('request', r => { if (/\/admins\//.test(r.url())) out.reqs.push({m:r.method(), u:r.url().replace(/https:\/\/[^/]+/,''), body:r.postData()}); });
  page.on('response', async r => { if (/\/admins\//.test(r.url())) out.reqs.push({resp:r.status(), u:r.url().replace(/https:\/\/[^/]+/,'')}); });
  await page.evaluate(DOM);
  const dlg = () => page.evaluate(() => {
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop(); if(!d) return null;
    return { title:(d.querySelector('h2')?.textContent||'').trim(),
      checked:[...d.querySelectorAll('input[type=checkbox]')].filter(i=>i.checked).map(i=>window.__qa.nameOf(i).replace(/\s+/g,' ')),
      all:[...d.querySelectorAll('input[type=checkbox]')].length };
  });
  out.before = await dlg();
  if (!out.before) { out.err = 'no dialog'; return out; }
  // tick "Manage chat" via a real click on its label/control
  const hit = await page.evaluate(() => {
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds.pop();
    const i=[...d.querySelectorAll('input[type=checkbox]')].find(x=>/^Manage chat$/.test(window.__qa.nameOf(x).trim()));
    if(!i) return null;
    const box = i.getBoundingClientRect().width>1 ? i : (i.closest('label') || d.querySelector(`label[for="${CSS.escape(i.id)}"]`) || i);
    box.scrollIntoView({block:'center'});
    const r=box.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height)};
  });
  out.tickTarget = hit;
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(800); }
  out.afterTick = await dlg();
  // submit
  await page.locator('[data-testid="admin-permissions-submit"]').first().click();
  await page.waitForTimeout(4000);
  out.afterSubmit = await dlg();
  return out;
};
