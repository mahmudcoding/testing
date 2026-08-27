/* Repro: Display settings "Reset all" does not reset the theme.
 * Report: lane E, "[FE-WEB][SHELL] Reset all в Display settings не сбрасывает тему"
 * Sets theme Dark / density Compact / font XL, then stops — you press Reset all. */
export default async ({ page }) => {
  const out = { ready: false, asserted: {}, leftToDo: '' };
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/chat/saved',
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Display settings lives in an <aside>, not [role=dialog] — see SELECTORS.md.
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+T' : 'Control+Shift+T');
  await page.waitForTimeout(1200);

  const panel = async () => page.evaluate(() => {
    const a = [...document.querySelectorAll('aside')]
      .find(x => /theme|density|font/i.test(x.innerText));
    if (!a) return null;
    const btns = [...a.querySelectorAll('button')].map(b => ({
      name: (b.getAttribute('aria-label') || b.textContent || '').trim(),
      pressed: b.getAttribute('aria-pressed'),
    })).filter(b => b.name);
    return { text: a.innerText.slice(0, 200), buttons: btns };
  });

  let p = await panel();
  if (!p) {
    out.leftToDo = 'Display settings did not open — do not judge this. Press ⌘⇧T by hand.';
    return out;
  }

  // click Dark, Compact, XL by their accessible names
  for (const want of ['Dark', 'Compact', 'XL']) {
    const hit = await page.evaluate((w) => {
      const a = [...document.querySelectorAll('aside')]
        .find(x => /theme|density|font/i.test(x.innerText));
      // the font-size buttons read "XL" on screen and "Extra large" to a11y —
      // match either, or the click silently misses and the state is never built
      const b = [...a.querySelectorAll('button')].find(x =>
        (x.getAttribute('aria-label') || '').trim() === w ||
        (x.textContent || '').trim() === w);
      if (!b) return false;
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, want);
    if (hit && hit.x) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(500); }
  }

  p = await panel();
  out.asserted = {
    url: page.url(),
    theme: await page.evaluate(() => document.documentElement.getAttribute('data-theme')
      || document.documentElement.className),
    pressed: p.buttons.filter(b => b.pressed === 'true').map(b => b.name),
    hasResetAll: p.buttons.some(b => /reset all/i.test(b.name)),
  };

  if (!out.asserted.hasResetAll) {
    out.leftToDo = 'Panel is open but no Reset all control found — follow the steps by hand.';
    return out;
  }
  out.ready = true;
  out.leftToDo = 'Theme, density and font size are now set away from their defaults '
               + `(selected: ${out.asserted.pressed.join(', ') || 'see the panel'}). `
               + 'Press Reset all and watch whether the theme goes back with the others.';
  return out;
};
