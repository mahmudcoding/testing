/* Enumerate the hub's Live-now card completely: does anything there say the call is recorded? */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const q = window.__qa;
    const all = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && q.vis(e));
    const texts = all.map(e => e.textContent.trim()).filter(Boolean);
    // the Live now section: smallest visible element containing the heading and a Join control
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].filter(q.vis)
      .filter(e => /live now/i.test(e.textContent));
    let section = null;
    if (heads.length) {
      let n = heads[0];
      while (n && !n.querySelector('button')) n = n.parentElement;
      section = n;
    }
    return {
      liveHeadFound: heads.length,
      liveSectionText: section ? section.innerText.replace(/\n{2,}/g,'\n').slice(0, 600) : null,
      recordingMentionsWholeHub: texts.filter(t => /record/i.test(t)),
      // control: prove the probe can see hub text at all
      sampleTexts: texts.slice(0, 12),
    };
  });
};
