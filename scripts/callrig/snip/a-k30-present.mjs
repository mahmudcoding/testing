/* Fresh-tab lobby read: hard reload first (tab age control), then measure BOTH
   the device-picker placeholder state and the "Already in room" list. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  // tab-age control: land on the workspace, hard reload, then navigate to the call
  await page.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil: 'commit', timeout: 90000 });
  await page.waitForTimeout(2000);
  await page.reload({ waitUntil: 'commit', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'commit', timeout: 90000 });
  await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen !== 'lobby') { out.url = page.url(); return out; }

  // (a) already-in-room, read from the DOM and from the API the lobby uses
  out.present = await page.evaluate(() => {
    const q = window.__qa;
    const nodes = [...document.querySelectorAll('[data-testid="lobby-present"]')];
    const wrap = nodes[0] ? nodes[0].closest('div') : null;
    // the smallest visible element containing the words "ALREADY IN ROOM"
    const cands = [...document.querySelectorAll('*')].filter(e=>q.vis(e) && /ALREADY IN ROOM/i.test(e.textContent||''));
    cands.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
    const box = cands[0];
    return {
      headerText: box ? box.innerText.replace(/\n/g,' | ').slice(0,200) : null,
      avatarCount: document.querySelectorAll('[data-testid="lobby-present-avatar"]').length,
      avatarLabels: [...document.querySelectorAll('[data-testid="lobby-present-avatar"]')]
        .map(e=>({ t:(e.textContent||'').trim(), aria:e.getAttribute('aria-label'), title:e.getAttribute('title') })),
      lobbySubtitle: (() => {
        const c = [...document.querySelectorAll('*')].filter(e=>q.vis(e) && /participants waiting/i.test(e.textContent||''));
        c.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
        return c[0] ? c[0].textContent.trim() : null; })(),
    };
  });
  out.participantsApi = await page.evaluate(async (cid) => {
    const r = await fetch(`/api/v1/meeting/${cid}/participants`, { credentials:'include' });
    const t = await r.text();
    return { s: r.status, bodyFull: t.slice(0, 900) };
  }, id);

  // (b) BUG-2 re-verify on this freshly reloaded page
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    b && b.click();
  });
  await page.waitForTimeout(2000);
  out.pickers = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[role=combobox]')].filter(e=>q.vis(e))
      .map(e=>({ aria:e.getAttribute('aria-label'), shows:e.innerText.trim().slice(0,45) }));
  });
  out.gum = await page.evaluate(() => (window.__gumCalls||[]).map(c=>JSON.stringify(c).slice(0,140)));
  return out;
};
