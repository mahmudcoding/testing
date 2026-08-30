/* One run: bring a guest into the call in a fresh context, PROVE they are in,
   then read another member's lobby "Already in room" over CDP. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM } from './lib.mjs';

export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};

  // 1. guest in
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto(link, { waitUntil: 'commit', timeout: 90000 });
  await gp.waitForTimeout(9000);
  await gp.locator('input[type=text]').first().fill('Guest Present');
  await gp.waitForTimeout(600);
  await gp.locator('button[type=submit]').first().click();
  await gp.waitForTimeout(15000);
  out.guest = await gp.evaluate(() => ({ url: location.pathname,
    inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
    roster: [...document.querySelectorAll('[data-testid="participant-name"]')].map(e=>e.textContent.trim()) }));
  if (!out.guest.inCall) { out.abort = 'guest never entered'; await gctx.close(); return out; }

  // 2. PROVE it from the host's side before reading anything else
  const ab = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','alice')}`);
  const ap = ab.contexts()[0].pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  out.hostSees = await ap.evaluate(async (cid) => {
    const r = await fetch(`/api/v1/meeting/${cid}/participants`, { credentials:'include' });
    const j = await r.json().catch(()=>({}));
    return { count: (j.participants||[]).length,
             rows: (j.participants||[]).map(p=>({ type:p.type, name:p.name, guest_id:p.guest_id ?? null })) };
  }, id);

  // 3. now the member lobby
  const bb = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('A','bob')}`);
  const bp = bb.contexts()[0].pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  await bp.goto(`https://airion-cargo.store/w/${ws}/calls`, { waitUntil:'commit', timeout:90000 });
  await bp.waitForTimeout(3000);
  await bp.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil:'commit', timeout:90000 });
  await bp.waitForTimeout(10000);
  await bp.evaluate(DOM);
  out.lobby = await bp.evaluate(() => {
    const q = window.__qa;
    const cands = [...document.querySelectorAll('*')].filter(e=>q.vis(e) && /ALREADY IN ROOM/i.test(e.textContent||''));
    cands.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
    return { screen: document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other',
             header: cands[0] ? cands[0].innerText.replace(/\n/g,' | ').slice(0,150) : null,
             avatars: [...document.querySelectorAll('[data-testid="lobby-present-avatar"]')]
               .map(e=>({ t:(e.textContent||'').trim(), aria:e.getAttribute('aria-label') })) };
  });
  out.lobbyApi = await bp.evaluate(async (cid) => {
    const r = await fetch(`/api/v1/meeting/${cid}/participants`, { credentials:'include' });
    return { s:r.status, b:(await r.text()).slice(0,800) };
  }, id);

  await ab.close().catch(()=>{}); await bb.close().catch(()=>{});
  await gctx.close();
  return out;
};
