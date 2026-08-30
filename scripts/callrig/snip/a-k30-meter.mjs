/* Does the lobby audio meter move? Poll its inner bar width for 20s while measuring
   the ACTUAL microphone energy from an independent stream (the positive control). */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.screen = await page.evaluate(() => document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other');
  out.micState = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-testid="lobby-device-bar"] button')]
      .find(e => /Microphone/i.test(e.getAttribute('aria-label')||''));
    return b ? { label: b.getAttribute('aria-label'), dstate: b.getAttribute('data-state') } : null;
  });

  // start an independent energy probe on the same default mic
  out.probeStarted = await page.evaluate(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaStreamSource(s);
      const an = ac.createAnalyser(); an.fftSize = 2048;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      window.__energy = { max: 0, samples: 0 };
      window.__energyTimer = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        let peak = 0; for (let i=0;i<buf.length;i++) { const v = Math.abs(buf[i]); if (v>peak) peak=v; }
        window.__energy.max = Math.max(window.__energy.max, peak);
        window.__energy.samples++;
      }, 100);
      return { ok: true, track: s.getAudioTracks()[0]?.label ?? null };
    } catch (e) { return { ok: false, err: String(e) }; }
  });

  const readMeter = () => page.evaluate(() => {
    const m = document.querySelector('[data-testid="lobby-audio-meter"]');
    if (!m) return null;
    const inner = m.firstElementChild;
    const r = inner ? inner.getBoundingClientRect() : null;
    return { outerW: Math.round(m.getBoundingClientRect().width),
             innerW: r ? +r.width.toFixed(1) : null,
             cls: inner ? inner.className.match(/w-[^\s]*/)?.[0] ?? null : null,
             style: inner ? (inner.getAttribute('style') || '') : null };
  });

  const samples = [];
  const t0 = Date.now();
  for (let i = 0; i < 60; i++) {
    samples.push({ t: Date.now()-t0, ...(await readMeter()) });
    await page.waitForTimeout(330);
  }
  out.energy = await page.evaluate(() => { clearInterval(window.__energyTimer); return window.__energy; });
  out.meterInnerWidths = [...new Set(samples.map(s => s.innerW))];
  out.meterClasses = [...new Set(samples.map(s => s.cls))];
  out.meterStyles = [...new Set(samples.map(s => s.style))];
  out.maxInnerW = Math.max(...samples.map(s => s.innerW ?? 0));
  out.outerW = samples[0]?.outerW ?? null;
  out.sampleCount = samples.length;
  out.durationMs = Date.now() - t0;
  return out;
};
