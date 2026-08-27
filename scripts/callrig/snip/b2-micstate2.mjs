export default async ({ page }) => {
  const ui = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const mic = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^(Mute|Unmute)$/i.test((b.getAttribute('aria-label')||b.textContent||'').trim()));
    return mic.map(b=>({ label:(b.getAttribute('aria-label')||b.textContent||'').trim(),
                         pressed:b.getAttribute('aria-pressed'), tid:b.getAttribute('data-testid') }));
  });
  const rtc = await page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const out = [];
    for (const pc of pcs) {
      pc.getSenders().forEach(s => { if (s.track && s.track.kind === 'audio')
        out.push({ kind:'audio', enabled:s.track.enabled, muted:s.track.muted, state:s.track.readyState }); });
    }
    return out;
  });
  return { micButtons: ui, localAudioTracks: rtc };
};
