/* In-call: is there a persistent recording indicator? Enumerate visible leaves AND
   any element carrying a recording-ish aria-label/title, plus tooltip-bearing nodes. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    const leaves = vis.filter(e => e.children.length === 0);
    return {
      url: location.pathname,
      recLeafText: [...new Set(leaves.map(e=>e.textContent.trim()).filter(t=>/record/i.test(t)))],
      recAria: [...new Set(vis.map(e => (e.getAttribute('aria-label')||'') + '|' + (e.getAttribute('title')||''))
        .filter(s => /record/i.test(s)))],
      recTestids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(t=>t && /record/i.test(t)))],
      // control: the probe can see the toolbar
      toolbarSample: [...new Set(vis.filter(e=>e.getAttribute('data-testid'))
        .map(e=>e.getAttribute('data-testid')).filter(t=>/call-controls|toolbar|header/i.test(t)))].slice(0,10),
    };
  });
};
