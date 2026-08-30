/* Select the Password entry mode in the open Start-a-call dialog, then re-read it. */
export default async ({ page }) => {
  const out = {};
  const read = async () => await page.evaluate(() => {
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
    const dlg = body.closest('[role=dialog]') || body;
    return {
      open: true,
      text: body.innerText.slice(0, 900),
      inputs: [...dlg.querySelectorAll('input,textarea')].filter(vis).map(e => ({
        type: e.getAttribute('type'), val: String(e.value).slice(0,30),
        ph: e.getAttribute('placeholder'), lab: e.getAttribute('aria-label'),
        checked: e.checked === undefined ? null : e.checked,
      })),
      submit: (() => {
        const b = document.querySelector('[data-testid="calls-start-submit"]');
        return b ? { text: b.textContent.trim(), dis: b.disabled === true || b.getAttribute('aria-disabled')==='true', visible: vis(b) } : null;
      })(),
    };
  });

  out.before = await read();
  await page.locator('[data-testid="calls-start-entry-password"]').click();
  await page.waitForTimeout(1200);
  out.afterPasswordSelected = await read();
  return out;
};
