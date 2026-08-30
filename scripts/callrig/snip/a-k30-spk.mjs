/* Pick a NON-default speaker in the lobby, then press Test audio and read the
   audio element's sinkId. Includes: proof the picker took the choice, and proof
   the browser supports setSinkId at all. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const want = process.env.K30_SPK || 'Fake Audio Output 2';
  const out = { want };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen !== 'lobby') return out;

  out.support = await page.evaluate(() => ({
    setSinkId: typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype,
    sinkIdProp: typeof HTMLMediaElement !== 'undefined' && 'sinkId' in HTMLMediaElement.prototype,
    outputs: null,
  }));
  out.support.outputs = await page.evaluate(async () =>
    (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audiooutput')
      .map(d=>({ label:d.label, id:d.deviceId.slice(0,10) })));

  // open lobby Settings and choose the speaker
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /^Settings$/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    b && b.click();
  });
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select speaker/i.test(e.getAttribute('aria-label')||''));
    c && c.click();
  });
  await page.waitForTimeout(1400);
  out.spkOptions = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('[role=option]')].filter(e=>q.vis(e))
      .map(e=>({ t:e.textContent.trim().slice(0,45), sel:e.getAttribute('aria-selected') }));
  });
  out.picked = await page.evaluate((w) => {
    const q = window.__qa;
    const o = [...document.querySelectorAll('[role=option]')].filter(e=>q.vis(e)).find(e=>e.textContent.trim()===w);
    if (!o) return { ok:false }; o.click(); return { ok:true, t:o.textContent.trim() };
  }, want);
  await page.waitForTimeout(1800);
  out.spkComboAfter = await page.evaluate(() => {
    const c = [...document.querySelectorAll('[role=combobox]')].find(e => /Select speaker/i.test(e.getAttribute('aria-label')||''));
    return c ? c.innerText.trim().slice(0,50) : null;
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);

  // now press Test audio and read the element
  const samples = [];
  const read = () => page.evaluate(() => [...document.querySelectorAll('audio')].map(e => ({
    src: (e.currentSrc||e.src||'').slice(-24), paused: e.paused, ct: +(e.currentTime||0).toFixed(2),
    sinkId: e.sinkId, vol: e.volume })));
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="lobby-check-row"]')];
    const spk = rows.find(e => /Speaker/i.test(e.innerText));
    const b = spk && [...spk.querySelectorAll('button')].find(x => /test audio/i.test(x.textContent||''));
    b && b.click();
  });
  for (let i=0;i<16;i++){ samples.push({ t:i*250, media: await read() }); await page.waitForTimeout(250); }
  out.sinkIdsSeen = [...new Set(samples.flatMap(s=>s.media.map(m=>m.sinkId)))];
  out.playedFrames = samples.filter(s=>s.media.some(m=>!m.paused)).length;
  out.maxCt = Math.max(0, ...samples.flatMap(s=>s.media.map(m=>m.ct)));
  return out;
};
