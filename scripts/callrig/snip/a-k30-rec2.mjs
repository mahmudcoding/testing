/* Alice: open the recording-access dialog and start recording. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 350); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData()||'').slice(0,200), res: b });
  });
  await page.evaluate(DOM);
  await page.locator('[data-testid="recording-start-access-trigger"]').click();
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(() => {
    const q = window.__qa;
    const dlgs = [...document.querySelectorAll('[role=dialog]')].filter(e => q.boxVis(e));
    const d = dlgs.find(e => e.querySelectorAll('button').length <= 12) || dlgs[dlgs.length-1];
    if (!d) return null;
    return { text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,600),
             buttons: [...d.querySelectorAll('button,[role=radio],input')].filter(e=>q.vis(e))
               .map(e => ({ tid:e.getAttribute('data-testid')||null,
                            l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
                            v: e.value !== undefined ? String(e.value).slice(0,20) : null,
                            checked: e.checked === undefined ? null : e.checked })) };
  });
  // press Start recording
  const btn = page.locator('button', { hasText: /^Start recording$/ });
  out.startBtnCount = await btn.count();
  if (out.startBtnCount) { await btn.first().click(); await page.waitForTimeout(6000); }
  out.api = seen;
  out.after = await page.evaluate(() => {
    const q = window.__qa;
    return { recBadge: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && q.vis(e))
               .map(e=>e.textContent.trim()).filter(t=>/record/i.test(t)).slice(0,10) };
  });
  return out;
};
