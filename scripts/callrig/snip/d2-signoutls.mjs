const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const SNAP = `() => { const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=(localStorage.getItem(k)||''); } return o; }`;
export default async ({ page }) => {
  // visit a couple of channels so recent-channels is populated
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDPRIVATE0001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const before = await page.evaluate(SNAP);

  // find and use Sign out
  let path = [];
  const tryClick = async (sel, note) => { const l = page.locator(sel).first();
    if (await l.count()) { await l.scrollIntoViewIfNeeded().catch(()=>{}); await l.click({ timeout: 6000 }).catch(()=>{}); path.push(note); await page.waitForTimeout(1500); return true; } return false; };
  await tryClick('button[aria-label*="profile" i]', 'profile-button')
    || await tryClick('button[aria-label*="account" i]', 'account-button')
    || await tryClick('header button:has(img)', 'header-avatar');
  let signedOut = false;
  for (const s of ['button:has-text("Sign out")', 'a:has-text("Sign out")', '[role=menuitem]:has-text("Sign out")']) {
    const l = page.locator(s).first();
    if (await l.count()) { await l.click({ timeout: 6000 }).catch(()=>{}); path.push('signout:'+s); signedOut = true; await page.waitForTimeout(3500); break; }
  }
  if (!signedOut) {
    const opts = await page.evaluate(`(() => { const vis = ${VIS};
      return [...document.querySelectorAll('button,[role=menuitem],a')].filter(vis)
        .map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,25); })()`);
    return { err: 'sign out control not reached', pathTried: path, visibleOptions: opts };
  }
  // confirm dialog?
  for (const s of ['button:has-text("Sign out")', 'button:has-text("Confirm")', 'button:has-text("Yes")']) {
    const l = page.locator(s).first();
    if (await l.count()) { await l.click({ timeout: 4000 }).catch(()=>{}); path.push('confirm:'+s); await page.waitForTimeout(3500); break; }
  }
  await page.waitForTimeout(4000);
  try { await page.waitForLoadState('networkidle', { timeout: 15000 }); } catch {}
  const url = page.url();
  let after = null;
  for (let i = 0; i < 5 && !after; i++) {
    try { after = await page.evaluate(SNAP); } catch { await page.waitForTimeout(1500); }
  }
  if (!after) return { err: 'could not read localStorage after sign out', url, path };
  const removed = Object.keys(before).filter(k => !(k in after));
  const kept = Object.keys(after).filter(k => k in before);
  const keptWithUserData = kept.filter(k => /U4Q[A-Z0-9]{12}/.test(k + before[k]));
  return { path, urlAfterSignOut: url.replace(/^https?:\/\/[^/]+/,''),
    keysBefore: Object.keys(before).length, keysAfter: Object.keys(after).length,
    removed, kept, keptCarryingUserIds: keptWithUserData,
    recentChannelsSurvived: after['aloqa.recent-channels.v1'] ? (after['aloqa.recent-channels.v1']||'').slice(0,150) : '(cleared)' };
};
