/* Infrastructure: clear any page zoom left on this window.
 * Kept as the undo for an experiment that did not work — CSS zoom does not
 * rescale viewport units, so the app laid out at 80% inside a full-size window
 * and left an empty band down the right and along the bottom. */
export default async ({ page }) => page.evaluate(() => {
  document.documentElement.style.zoom = '';
  document.body.style.zoom = '';
  const bot = document.elementFromPoint(Math.round(innerWidth/2), innerHeight - 6);
  return { zoom: document.documentElement.style.zoom || '(none)',
           bottomEdgeNowHolds: bot ? bot.tagName : 'null' };
});
