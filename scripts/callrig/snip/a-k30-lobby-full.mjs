/* Land on a call's deep link and enumerate the LOBBY completely:
   every visible leaf text node and every interactive control. No slicing of the
   set we make claims about. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = { id };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.url = page.url();
  out.lobby = await page.evaluate(() => {
    const q = window.__qa;
    const page_ = document.querySelector('[data-testid="lobby-page"]');
    const scope = page_ || document.body;
    // every visible leaf text inside the lobby — complete, not sliced
    const leaves = [...scope.querySelectorAll('*')]
      .filter(e => e.children.length === 0 && q.vis(e))
      .map(e => e.textContent.trim()).filter(Boolean);
    const controls = [...scope.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=switch],[role=checkbox]')]
      .filter(e => q.vis(e))
      .map(e => ({ tag: e.tagName, tid: e.getAttribute('data-testid') || null,
                   l: (e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().slice(0,50),
                   dis: e.disabled === true || e.getAttribute('aria-disabled')==='true',
                   pressed: e.getAttribute('aria-pressed'), checked: e.getAttribute('aria-checked') }));
    return {
      lobbyPresent: !!page_,
      leaves: [...new Set(leaves)],
      controls,
      allTestids: [...new Set([...scope.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))],
      // whole-document search for any recording word, regardless of container
      recordingMentionsWholeDoc: [...document.querySelectorAll('*')]
        .filter(e => e.children.length === 0 && q.vis(e))
        .map(e => e.textContent.trim())
        .filter(t => /record/i.test(t)),
    };
  });
  return out;
};
