export default async ({ ctx }) => {
  const routes = [
    ['/join/deadbeefdeadbeefdeadbeefdeadbeef', 'guest invite link'],
    ['/magic-link/verify?token=deadbeef', 'magic link'],
    ['/invite?token=deadbeef', 'workspace invite'],
    ['/workspace/invite/accept?token=deadbeef', 'invite accept'],
  ];
  await ctx.clearCookies();
  const out = [];
  for (const [path, label] of routes) {
    const p = await ctx.newPage();
    try {
      await p.goto('https://airion-cargo.store' + path, { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(5000);
      const r = await p.evaluate(() => {
        const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
          let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
          return o>0.05; };
        const sel = 'button, a[href], input, select, textarea, summary, details, [role="button"], [role="link"], [onclick], [tabindex]';
        const ctl = [...document.querySelectorAll(sel)].filter(v)
          .map(e => ((e.getAttribute('aria-label')||'') + '|' + (e.innerText||e.value||'')).replace(/\s+/g,' ').replace(/^\||\|$/g,'').trim().slice(0,34))
          .filter(Boolean);
        return { chars: (document.body.innerText||'').length,
                 text: (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,110),
                 count: ctl.length, controls: [...new Set(ctl)].slice(0,8) };
      });
      out.push({ label, path: path.split('?')[0], ...r });
    } catch (e) { out.push({ label, err: String(e).slice(0,60) }); }
    await p.close();
  }
  return out;
};
