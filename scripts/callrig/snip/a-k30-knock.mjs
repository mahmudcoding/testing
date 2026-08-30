/* Walk the door on an approval-gated call and describe the waiting screen fully. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*meeting/i.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 400); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.lobbyText = await page.evaluate(() =>
    (document.querySelector('[data-testid="lobby-page"]')||document.body).innerText.replace(/\n{2,}/g,'\n').slice(0,400));
  await page.locator('[data-testid="lobby-join"]').click();
  await page.waitForTimeout(6000);
  out.api = seen;
  out.waiting = await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    return {
      url: location.pathname,
      docText: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0, 700),
      controls: [...document.querySelectorAll('button,a[href],input,[role=button]')].filter(e=>q.vis(e))
        .map(e => ({ tid: e.getAttribute('data-testid'),
                     l: (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45),
                     dis: e.disabled===true||e.getAttribute('aria-disabled')==='true' })),
      testids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(Boolean))]
        .filter(t=>/wait|approv|lobby|call|knock|pending/i.test(t)),
    };
  });
  return out;
};
