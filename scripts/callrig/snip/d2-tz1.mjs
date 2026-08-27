const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;

// Anything that renders as a date or a clock time. Deliberately broad: the point is to
// find every timestamp on the screen, not only the ones I predicted.
const GRAB = `(() => { const vis=(${VIS});
  const main=document.querySelector('main')||document.body;
  const RE=/\\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}(?:,\\s*\\d{4})?(?:,\\s*\\d{1,2}:\\d{2}\\s*(?:AM|PM))?|\\b\\d{1,2}:\\d{2}\\s*(?:AM|PM)\\b|\\b\\d{1,2}:\\d{2}\\b/g;
  const out=[]; const seen=new Set();
  const walk=document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  let t;
  while ((t=walk.nextNode())) {
    const p=t.parentElement; if (!p || !vis(p)) continue;
    const s=(t.textContent||'').replace(/\\s+/g,' ').trim(); if (!s) continue;
    const m=s.match(RE); if (!m) continue;
    for (const hit of m) { const k=out.length+'|'+hit; if(seen.has(k)) continue; seen.add(k); out.push(hit.trim()); }
  }
  return out;
})()`;

const ROUTES = ['settings/admin/audit-log','settings/admin/members','settings/admin/invites',
                'settings/sessions','settings/admin/workspaces','settings/company'];

export default async ({ page, ctx }) => {
  const W='W4QDF1XTURESO01';
  const cdp = await ctx.newCDPSession(page);
  const collect = async () => {
    const acc={};
    for (const r of ROUTES) {
      await page.goto(`https://airion-cargo.store/w/${W}/${r}`, { waitUntil:'networkidle' });
      await page.waitForTimeout(2600);
      acc[r] = await page.evaluate(GRAB);
    }
    return acc;
  };
  let base, shifted, tzSeen={};
  try {
    tzSeen.before = await page.evaluate(`Intl.DateTimeFormat().resolvedOptions().timeZone`);
    base = await collect();
    await cdp.send('Emulation.setTimezoneOverride', { timezoneId: 'America/New_York' });
    await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
    tzSeen.after = await page.evaluate(`Intl.DateTimeFormat().resolvedOptions().timeZone`);
    shifted = await collect();
  } finally {
    try { await cdp.send('Emulation.setTimezoneOverride', { timezoneId: '' }); } catch {}
    try { await cdp.detach(); } catch {}
  }
  const report={};
  for (const r of ROUTES) {
    const a=base[r]||[], b=shifted[r]||[];
    const n=Math.min(a.length,b.length);
    let same=0, diff=0; const samples=[];
    for (let i=0;i<n;i++){
      if (a[i]===b[i]) same++;
      else { diff++; if (samples.length<3) samples.push({ tashkent:a[i], newYork:b[i] }); }
    }
    report[r]={ found:a.length, alsoFound:b.length, unchanged:same, changed:diff, samples };
  }
  return { tz: tzSeen, report };
};
