export default async ({ page }) => {
  const before = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    return b ? { label:(b.getAttribute('aria-label')||b.textContent).trim(), pressed:b.getAttribute('aria-pressed'),
                 disabled:b.disabled } : 'NOT-FOUND'; });
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if (b) b.click(); });
  await page.waitForTimeout(3500);
  const after = await page.evaluate(async () => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/^(Mute|Unmute)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    const tracks = [];
    for (const pc of (window.__pcs||[])) pc.getSenders().forEach(s=>{ if(s.track&&s.track.kind==='audio')
      tracks.push({enabled:s.track.enabled}); });
    const toasts = [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
      .filter(v).map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,110)).filter(Boolean);
    return { button: b ? { label:(b.getAttribute('aria-label')||b.textContent).trim(),
             pressed:b.getAttribute('aria-pressed'), disabled:b.disabled } : 'NOT-FOUND', tracks, toasts };
  });
  return { before, after };
};
