/* lane B helper — reach a SECOND account's browser from inside a repro snippet.
 *
 * drive.mjs connects to exactly one browser, and the bench brings up only the
 * accounts it derives from the finding's own text. A finding that needs two people
 * therefore has to be driven from one account and pull the other browser up itself.
 *
 * Lane B only. Creates nothing shared; no other lane's snippets import it.
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
                 { cwd: RIG, stdio: 'pipe', timeout: 240000 });
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

/** Make THIS browser anonymous — a guest-link screen only behaves like a guest's when
 *  nothing is signed in. ensure.sh signs every account in, including `guest`, so a
 *  guest-link snippet has to undo that itself rather than assume a clean profile. */
export async function signOut(ctx, page) {
  const before = await page.evaluate(async () => {
    try { const r = await fetch('/api/v1/auth/me', { credentials: 'include' }); return r.ok ? (await r.json()).email : null; }
    catch { return null; }
  }).catch(() => null);
  if (!before) return { was: null, now: null };
  try { await ctx.clearCookies(); }
  catch {
    const s = await ctx.newCDPSession(page);
    await s.send('Network.clearBrowserCookies');
  }
  await page.goto('https://staging.airion-cargo.store/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const now = await page.evaluate(async () => {
    try { const r = await fetch('/api/v1/auth/me', { credentials: 'include' }); return r.ok ? (await r.json()).email : null; }
    catch { return null; }
  }).catch(() => null);
  return { was: before, now };
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

/** Split the usable screen (right of the app's reserved strip) into two halves and put a
 *  window in one of them. A finding whose defect is «one screen changes, the other does not»
 *  is only judgeable when both windows are visible at once. */
export async function placeHalf({ browser, ctx, page }, side) {
  const reserve = Number(process.env.QA_TILE_LEFT || 520);
  const s = await page.evaluate(() => ({
    w: screen.availWidth, h: screen.availHeight,
    left: screen.availLeft || 0, top: screen.availTop || 0,
  }));
  const usable = Math.max(720, s.w - reserve);
  const half = Math.floor(usable / 2);
  const left = s.left + reserve + (side === 'right' ? half : 0);
  const ps = await ctx.newCDPSession(page);
  const { targetInfo } = await ps.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  const { windowId } = await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
  await bs.send('Browser.setWindowBounds', { windowId, bounds: { left, top: s.top, width: half, height: s.h } });
  await page.bringToFront();
}
