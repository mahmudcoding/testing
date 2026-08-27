export default async ({ page }) => {
  const out = { steps: [] };
  const vis = el => { const r = el.getBoundingClientRect(); return r.width>0 && r.height>0; };
  // open the dialog if not open
  let opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button'))
      .find(b => /^End for everyone$/.test(b.textContent.trim()) && b.getBoundingClientRect().width>0);
    if (b) { b.click(); return true; } return false;
  });
  out.steps.push({ openedDialog: opened });
  await page.waitForTimeout(1200);
  out.steps.push({ dialogButtons: await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="dialog"] button, [data-testid*="confirm"]'))
      .filter(b=>b.getBoundingClientRect().width>0)
      .map(b => ({ t: b.textContent.trim().slice(0,40), tid: b.getAttribute('data-testid') })) ) });
  const clicked = await page.evaluate(() => {
    const cands = Array.from(document.querySelectorAll('[role="dialog"] button'))
      .filter(b=>b.getBoundingClientRect().width>0);
    const submit = cands.find(b => (b.getAttribute('data-testid')||'').includes('confirm-submit'))
                || cands.find(b => /^End for everyone$/.test(b.textContent.trim()))
                || cands.find(b => /^End/.test(b.textContent.trim()));
    if (!submit) return null;
    const tid = submit.getAttribute('data-testid'); const t = submit.textContent.trim();
    submit.click(); return { t, tid };
  });
  out.steps.push({ clickedConfirm: clicked });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(() => ({
    url: location.pathname,
    tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length,
    hasLeave: !!Array.from(document.querySelectorAll('button')).find(b=>/^Leave call$/.test(b.textContent.trim()))
  }));
  return out;
};
