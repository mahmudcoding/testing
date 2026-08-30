/* Navigate to a call id and report the gate surface the joiner meets. */
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = { id };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  out.url = page.url();
  out.gate = await page.evaluate(() => {
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
    const controls = [...document.querySelectorAll('button,a[href],input,textarea,select,[role=button]')]
      .filter(vis).map(e => ({
        tag: e.tagName, type: e.getAttribute('type') || null,
        tid: e.getAttribute('data-testid') || null,
        label: (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 50),
        dis: e.disabled === true || e.getAttribute('aria-disabled') === 'true',
      }));
    const root = document.querySelector('main') || document.body;
    return {
      bodyText: document.body.innerText.replace(/\s+\n/g, '\n').slice(0, 700),
      controls,
      testids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')))]
        .filter(t => /call|lobby|password|wait|join|device|gate|approve/i.test(t)).slice(0, 40),
    };
  });
  return out;
};
