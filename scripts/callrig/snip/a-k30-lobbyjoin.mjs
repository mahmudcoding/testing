/* From the lobby, press Join and report what gate appears. */
export default async ({ page }) => {
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let body = null; try { body = (await r.text()).slice(0, 500); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                req: (r.request().postData() || '').slice(0, 300), res: body });
  });
  out.lobbyText = await page.evaluate(() => (document.querySelector('[data-testid="lobby-page"]')||document.body).innerText.slice(0, 800));
  const j = page.locator('[data-testid="lobby-join"]');
  out.joinCount = await j.count();
  if (!out.joinCount) { out.abort = 'no lobby-join'; return out; }
  await j.click();
  await page.waitForTimeout(6000);
  out.api = seen;
  out.url = page.url();
  out.after = await page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      let n = e, op = 1;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        op *= parseFloat(cs.opacity || '1');
        n = n.parentElement;
      }
      return op > 0.05;
    };
    return {
      text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0, 800),
      controls: [...document.querySelectorAll('button,input,[role=button]')].filter(vis).map(e => ({
        tid: e.getAttribute('data-testid') || null, type: e.getAttribute('type')||null,
        l: (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0,45),
        dis: e.disabled === true || e.getAttribute('aria-disabled') === 'true' })),
      testids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))]
        .filter(t=>/password|gate|lobby|wait|approv|call/i.test(t)).slice(0,30),
    };
  });
  return out;
};
