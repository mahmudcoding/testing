/* Infrastructure, not a repro: zoom the page out so more of the app fits in the
 * strip beside Reproducer — the same thing Cmd+Minus does.
 *   QA_ZOOM — scale, default 0.8
 *
 * Runs AFTER the repro snippet, never during one. CSS zoom relayouts, so every
 * rect a snippet measures would move under it, and the eighty-eight snippets
 * were all verified at 1.0. This only changes what the person looks at.
 *
 * Re-applied on soft navigation: the app is a SPA, but a hard reload drops it.
 */
export default async ({ page }) => {
  const z = Number(process.env.QA_ZOOM || 0.8);
  return page.evaluate((z) => {
    document.documentElement.style.zoom = String(z);
    return {
      zoom: document.documentElement.style.zoom,
      // what the page now lays out in, so the effect is measured not assumed
      layoutWidth: document.documentElement.clientWidth,
      windowWidth: window.outerWidth,
    };
  }, z);
};
