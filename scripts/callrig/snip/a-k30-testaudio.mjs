/* Press "Test audio" in the lobby and measure whether anything plays: poll from before
   the click for audio elements, their currentTime/paused, and the row's own state. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  if (out.screen !== 'lobby') return out;

  const snap = () => page.evaluate(() => {
    const q = window.__qa;
    const rows = [...document.querySelectorAll('[data-testid="lobby-check-row"]')];
    const spk = rows.find(e => /Speaker/i.test(e.innerText));
    const media = [...document.querySelectorAll('audio,video')].map(e => ({
      tag: e.tagName, src: (e.currentSrc||e.src||'').slice(-40), paused: e.paused,
      ct: +(e.currentTime||0).toFixed(2), dur: isFinite(e.duration) ? +e.duration.toFixed(2) : null,
      vol: e.volume, sinkId: e.sinkId ?? null, muted: e.muted }));
    return { spkRow: spk ? spk.innerText.replace(/\n/g,' | ') : null,
             spkButtons: spk ? [...spk.querySelectorAll('button')].filter(x=>q.vis(x))
               .map(x=>({ l:(x.getAttribute('aria-label')||x.textContent||'').trim(),
                          dis:x.disabled===true||x.getAttribute('aria-disabled')==='true',
                          dstate:x.getAttribute('data-state') })) : null,
             media };
  });

  const samples = [];
  const t0 = Date.now();
  samples.push({ t: 0, tag:'pre', ...(await snap()) });
  const c = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="lobby-check-row"]')];
    const spk = rows.find(e => /Speaker/i.test(e.innerText));
    const b = spk && [...spk.querySelectorAll('button')].find(x => /test audio/i.test(x.textContent||x.getAttribute('aria-label')||''));
    if (!b) return { ok:false }; b.click(); return { ok:true };
  });
  out.click = c;
  for (let i=0;i<30;i++){ samples.push({ t: Date.now()-t0, tag:'post', ...(await snap()) }); await page.waitForTimeout(300); }
  out.transitions = samples.filter((s,i)=> i===0 || JSON.stringify(s.spkButtons)!==JSON.stringify(samples[i-1].spkButtons)
    || s.media.length !== samples[i-1].media.length
    || JSON.stringify(s.media.map(m=>m.paused))!==JSON.stringify(samples[i-1].media.map(m=>m.paused)));
  out.maxCurrentTime = Math.max(0, ...samples.flatMap(s=>s.media.map(m=>m.ct)));
  out.anyMediaEverPresent = samples.some(s=>s.media.length>0);
  out.rowStates = [...new Set(samples.map(s=>s.spkRow))];
  return out;
};
