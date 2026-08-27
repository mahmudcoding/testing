/* Diagnostic: where is this page, and what call controls does it actually have? */
import { install } from './a-callkit.mjs';
export default async ({ page, pages }) => {
  await install(page);
  return {
    url: page.url().replace(/https?:\/\/[^/]+/, ''),
    otherTabs: (pages || []).map((p) => p.url().replace(/https?:\/\/[^/]+/, '')).slice(0, 6),
    ...(await page.evaluate(() => ({
      visibility: document.visibilityState,
      // every visible control that is named, so a missing one is a fact not a guess
      namedButtons: [...document.querySelectorAll('button[aria-label]')]
        .filter(window.__qa.vis)
        .map((b) => b.getAttribute('aria-label'))
        .slice(0, 24),
      hasParticipantsBtn: !!document.querySelector('button[aria-label="Participants"]'),
      participantsPressed: (document.querySelector('button[aria-label="Participants"]') || {})
        .getAttribute ? document.querySelector('button[aria-label="Participants"]').getAttribute('aria-pressed') : null,
      bodyStart: (document.body.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 160),
    }))),
  };
};
