/* lane E helper — reach a SECOND account's browser from inside a repro snippet.
 *
 * The bench only ever brings up `alice` (verify_queue.roles_needed collapses every
 * lane-E finding to "any signed-in account"), and it drives the first account named
 * in the repro block. So a two-account finding has to be driven from alice and pull
 * the other browser up itself — which is what this does.
 *
 * Lane E only; never used by another lane's snippets, and it edits nothing shared.
 */
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { rigPort } from '../rigmap.mjs';

const RIG = path.dirname(path.dirname(fileURLToPath(import.meta.url)));  // scripts/callrig

/** Bring `account` up + signed in, and hand back a driveable page in its browser. */
export async function second(lane, account) {
  let ensured = 'ok';
  try {
    execFileSync(path.join(RIG, 'ensure.sh'), [lane, account],
                 { cwd: RIG, stdio: 'pipe', timeout: 180000 });
  } catch (e) {
    ensured = 'ensure.sh failed: ' + String(e.stderr || e.message).slice(0, 200);
  }
  const port = rigPort(lane, account);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const ctx = browser.contexts()[0];
  const all = ctx.pages().filter(p => !p.url().startsWith('devtools://'));
  const page = all.find(p => p.url().includes('airion-cargo.store')) || all[0] || await ctx.newPage();
  const email = await page.evaluate(async () => {
    try { return (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).email; }
    catch { return null; }
  }).catch(() => null);
  return { browser, ctx, page, port, email, ensured };
}

/** Park a window on the right of the screen and front it — same geometry as _tile.mjs. */
export async function tile({ browser, ctx, page }) {
  const reserve = Number(process.env.QA_TILE_LEFT || 520);
  const s = await page.evaluate(() => ({
    w: screen.availWidth, h: screen.availHeight,
    left: screen.availLeft || 0, top: screen.availTop || 0,
  }));
  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId } = await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  await bs.send('Browser.setWindowBounds',
    { windowId, bounds: { left: s.left + reserve, top: s.top, width: Math.max(560, s.w - reserve), height: s.h } });
  await page.bringToFront();
}
