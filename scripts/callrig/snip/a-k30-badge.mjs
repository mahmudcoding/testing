import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const b = document.querySelector('[data-testid="call-recording-badge"]');
    if (!b) return { present: false };
    const r = b.getBoundingClientRect();
    return {
      present: true, vis: q.boxVis(b), rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
      innerText: b.innerText, textContent: b.textContent,
      aria: b.getAttribute('aria-label'), title: b.getAttribute('title'),
      html: b.outerHTML.slice(0, 400),
    };
  });
};
