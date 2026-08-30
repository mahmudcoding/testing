/* Open the DM with a person and enumerate every control, so the call entry point is
   found rather than guessed. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ws = 'W4QAF1XTURESO01';
  const who = process.env.K30_WHO || 'QA Bob';
  const out = { who };
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil:'commit', timeout:90000 });
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  const c = await page.evaluate((n) => window.__qa.clickDeepest(new RegExp('^' + n + '$')), who);
  out.sidebarClick = c.ok ? c.name : c.why;
  await page.waitForTimeout(5000);
  out.url = page.url();
  out.controls = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button,a[href],[role=button]')].filter(e=>q.vis(e))
      .map(e=>({ tid:e.getAttribute('data-testid'),
                 l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
                 rect:(r=>({x:Math.round(r.x),y:Math.round(r.y)}))(e.getBoundingClientRect()) }))
      .filter(x=>x.l||x.tid);
  });
  out.callish = out.controls.filter(x => /call|phone|video/i.test((x.l||'')+(x.tid||'')));
  return out;
};
