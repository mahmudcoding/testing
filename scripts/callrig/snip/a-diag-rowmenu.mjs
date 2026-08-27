/* Diagnostic (not a repro): why does the host's Participants panel yield no row
 * menu for a participant who is inside a side room? Run against a live call in
 * exactly that state. Enumerates, it does not click. */
import { openPeople, install } from './a-callkit.mjs';

export default async ({ page }) => {
  await openPeople(page);
  await install(page);
  return page.evaluate(() => {
    const short = (n) => (n.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const panel = document.querySelector('[data-testid="participants-list"]');
    const rows = [...document.querySelectorAll('[data-testid="participant-row"]')];
    // what does the panel actually hold, if the testid finds nothing
    const testids = panel
      ? [...new Set([...panel.querySelectorAll('[data-testid]')]
          .map((n) => n.getAttribute('data-testid')))]
      : [];
    const bobRow = rows.find((r) => (r.innerText || '').includes('QA Bob'));
    const bobIn = (n) => n && (n.innerText || '').includes('QA Bob');
    // smallest element in the panel holding the name, and every button under it
    let smallest = null;
    if (panel) {
      const cands = [...panel.querySelectorAll('*')].filter(bobIn);
      cands.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
      smallest = cands[0] || null;
    }
    const btns = (n) => n ? [...n.querySelectorAll('button')].map((b) =>
      `${b.getAttribute('aria-label') || (b.innerText || '').trim().slice(0, 24) || '(unnamed)'}`
      + `${b.disabled ? ' [disabled]' : ''}`) : [];
    return {
      panelPresent: !!panel,
      panelTestids: testids.slice(0, 14),
      rowCount: rows.length,
      rowTexts: rows.map(short),
      bobRowFound: !!bobRow,
      bobRowButtons: btns(bobRow),
      // if the testid row is not what carries the name, this is what does
      smallestHoldingName: smallest ? smallest.tagName + '.' + (smallest.className || '').toString().slice(0, 50) : null,
      smallestText: smallest ? short(smallest) : null,
      smallestButtons: btns(smallest),
      // and its ancestors, in case the control sits one level up
      ancestorButtons: smallest && smallest.parentElement ? btns(smallest.parentElement) : [],
      grandparentButtons: smallest && smallest.parentElement && smallest.parentElement.parentElement
        ? btns(smallest.parentElement.parentElement) : [],
    };
  });
};
