export default async ({ page }) => {
  // capture body signatures from the earliest possible moment on each navigation
  await page.addInitScript(() => {
    window.__frames = [];
    const t0 = Date.now();
    const cap = () => {
      try {
        const t = (document.body && document.body.innerText) || '';
        window.__frames.push({ t: Date.now() - t0, len: t.length,
          empty: /Bring everyone together/i.test(t),
          dirs: /Search directories|People\s*\|?\s*Channels/i.test(t),
          live: /Live now/i.test(t), liveBadge: /\bLIVE\b/.test(t),
          head: t.replace(/\s+/g,' ').slice(0, 70) });
      } catch (e) {}
    };
    const iv = setInterval(cap, 100);
    setTimeout(() => clearInterval(iv), 12000);
    cap();
  });
  const rounds = Number(process.env.QA_RELOADS || 1);
  const out = [];
  for (let i = 1; i <= rounds; i++) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const frames = await page.evaluate(() => (window.__frames || []).slice(0, 90));
    // collapse consecutive identical signatures
    const seen = []; let last = '';
    for (const f of frames) {
      const sig = `${f.empty}|${f.dirs}|${f.live}|${f.liveBadge}|${f.head}`;
      if (sig !== last) { seen.push(f); last = sig; }
    }
    out.push({ reload: i, distinctStates: seen.length,
               anyEmptyState: frames.some(f=>f.empty), anyDirectories: frames.some(f=>f.dirs),
               liveNowFirstSeenAt: (frames.find(f=>f.live)||{}).t ?? null,
               timeline: seen.slice(0, 10) });
  }
  return { url: page.url().slice(-34), rounds: out };
};
