/* Re-measure the lobby for ANY recording indication, with a probe that does not
   restrict to leaf nodes (the in-call badge is <span><svg/>Recording</span> and a
   leaf-only probe misses it). Three independent instruments. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = { id };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.probe = await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    // instrument 1 — every visible element's own text, smallest first
    const byText = vis.filter(e => /record/i.test(e.textContent || ''))
      .map(e => ({ tag: e.tagName, tid: e.getAttribute('data-testid'), t: e.textContent.trim().slice(0,60), len: e.textContent.length }))
      .sort((a,b) => a.len - b.len).slice(0, 6);
    // instrument 2 — testid / aria / title / role, no text at all
    const byAttr = vis.filter(e => /record|consent/i.test(
        (e.getAttribute('data-testid')||'') + (e.getAttribute('aria-label')||'') + (e.getAttribute('title')||'')))
      .map(e => ({ tag: e.tagName, tid: e.getAttribute('data-testid'), aria: e.getAttribute('aria-label') }));
    // instrument 3 — the whole visible document innerText, uncut, searched not printed
    const docText = (document.body.innerText || '');
    return {
      screen: document.querySelector('[data-testid="lobby-page"]') ? 'lobby'
            : document.querySelector('[data-testid="call-password-gate"]') ? 'password'
            : document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other',
      byText, byAttr,
      docTextLen: docText.length,
      docHasRecord: /record/i.test(docText),
      docHasConsent: /consent|acknowledg/i.test(docText),
      // checkbox of any kind anywhere
      checkboxes: [...document.querySelectorAll('input[type=checkbox],[role=checkbox]')].map(e=>({vis:q.vis(e)})),
      // POSITIVE CONTROL for the same three instruments: a string that IS on screen
      controlByText: vis.filter(e => /Ready to join/i.test(e.textContent||'')).length,
      controlDocHas: /Ready to join/i.test(docText),
    };
  });
  return out;
};
