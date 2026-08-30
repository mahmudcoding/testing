/* Read the currently-open Start a call dialog in full. */
export default async ({ page }) => {
  return await page.evaluate(() => {
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
    const body = document.querySelector('[data-testid="calls-start-dialog-body"]');
    if (!body) return { open: false };
    const controls = [...body.querySelectorAll('button,a[href],input,textarea,select,[role=button],[role=switch],[role=radio],[role=tab]')]
      .filter(vis)
      .map(e => ({
        tag: e.tagName,
        type: e.getAttribute('type') || null,
        tid: e.getAttribute('data-testid') || null,
        label: (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0, 60),
        checked: e.getAttribute('aria-checked') ?? (e.checked === undefined ? null : String(e.checked)),
        selected: e.getAttribute('aria-selected') ?? null,
        pressed: e.getAttribute('aria-pressed') ?? null,
        dstate: e.getAttribute('data-state') ?? null,
        dis: e.disabled === true || e.getAttribute('aria-disabled') === 'true',
        value: e.value !== undefined ? String(e.value).slice(0, 40) : null,
      }));
    return { open: true, text: body.innerText.slice(0, 1200), controls };
  });
};
