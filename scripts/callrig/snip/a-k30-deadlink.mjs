/* Enumerate EVERY interactive element on the invalid-guest-link screen, stated per selector. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(9000);
  await gp.evaluate(DOM);
  const out = await gp.evaluate(() => {
    const q = window.__qa;
    const per = (sel) => [...document.querySelectorAll(sel)].filter(e=>q.vis(e))
      .map(e=>({ tag:e.tagName, href:e.getAttribute('href')||null,
                 t:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
                 rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect()) }));
    return {
      docText: document.body.innerText.replace(/\n{2,}/g,'\n'),
      button:    per('button'),
      anchor:    per('a[href]'),
      input:     per('input'),
      tabindex:  per('[tabindex]'),
      roleButton: per('[role=button]'),
      // any element that is focusable at all
      focusable: [...document.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"]),[role=button],[role=link]')]
        .filter(e=>q.vis(e)).length,
    };
  });
  await gctx.close();
  return out;
};
