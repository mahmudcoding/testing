import { DOM } from './lib.mjs';
import { install, openPeople, panel, callIdOf } from './a-callkit.mjs';
export default async ({ page }) => {
  await install(page);
  const before = await page.evaluate(() => ({
    url: location.pathname,
    vis: document.visibilityState,
    dialogs: [...document.querySelectorAll('[role=dialog]')].map((d) => ({
      tid: d.getAttribute('data-testid'),
      vis: window.__qa.boxVis(d),
      head: (d.innerText || '').replace(/\s+/g, ' ').slice(0, 80),
    })),
    buttons: [...document.querySelectorAll('button')].filter(window.__qa.vis)
      .map((b) => (window.__qa.nameOf(b) || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t).slice(0, 60),
  }));
  const opened = await openPeople(page).catch((e) => ({ err: String(e).slice(0, 120) }));
  await page.waitForTimeout(1500);
  const p = await panel(page).catch((e) => ({ err: String(e).slice(0, 120) }));
  return { callId: callIdOf(page), before, opened, panelRows: (p.rows || []).map((r) => r.slice(0, 80)), panelRaw: p.err || null };
};
