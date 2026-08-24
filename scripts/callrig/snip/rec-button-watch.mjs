export default async ({page}) => {
  const M = process.env.QA_MEET;
  const samples = [];
  const toasts = [];
  await page.exposeFunction('__qaT', t => toasts.push({t, at: Date.now()})).catch(()=>{});
  await page.evaluate(() => {
    if (window.__qaW) return; window.__qaW = 1;
    const seen = new Set();
    setInterval(() => {
      document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]').forEach(e => {
        const t = e.innerText.replace(/\n+/g,' ').trim();
        if (t && !seen.has(t)) { seen.add(t); window.__qaT && window.__qaT(t.slice(0,120)); }
      });
    }, 200);
  });
  const snap = () => page.evaluate(() => {
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    const b = [...tb.querySelectorAll('button')].find(x => /record/i.test(x.getAttribute('aria-label')||'')
                || /recording/i.test(x.getAttribute('data-testid')||''));
    if (!b) return {none:true};
    const cs = getComputedStyle(b);
    const svg = b.querySelector('svg, span');
    return {
      aria: b.getAttribute('aria-label'), tid: b.getAttribute('data-testid'),
      color: cs.color, bg: cs.backgroundColor,
      inner: svg ? getComputedStyle(svg).color : null,
      cls: (b.className||'').toString().slice(0,90),
      badge: !!document.querySelector('[data-testid="call-recording-badge"]')
    };
  });
  const api = () => page.evaluate(async (M) => {
    const j = await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).json();
    const r = (j.recordings||[])[0];
    return r ? {status:r.status, dur:r.duration_sec, size:r.file_size} : null;
  }, M);

  const t0 = Date.now();
  const tick = async (tag) => samples.push({tag, ms: Date.now()-t0, ui: await snap(), api: await api()});

  await tick('idle');
  // start
  await page.click('[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1500);
  const dlgBtn = page.locator('[role="dialog"] button', {hasText:'Start recording'}).first();
  if (await dlgBtn.count()) await dlgBtn.click();
  await page.waitForTimeout(6000);
  await tick('recording');
  await page.waitForTimeout(20000);
  await tick('recording+20s');

  // stop
  const stop = page.locator('[data-testid="call-toolbar"] button[aria-label="Stop recording"]').first();
  const tStop = Date.now();
  if (await stop.count()) await stop.click(); else samples.push({tag:'NO STOP BUTTON'});
  for (const w of [500, 1000, 2000, 3000, 5000, 8000, 12000, 20000, 30000, 45000]) {
    while (Date.now()-tStop < w) await page.waitForTimeout(250);
    await tick('stop+'+w+'ms');
  }
  return {stopClickedAtMs: tStop-t0, samples, toasts: toasts.map(x=>({ms:x.at-t0, t:x.t}))};
};
