export default async ({ ctx }) => {
  const routes = [
    ['/join/deadbeefdeadbeefdeadbeefdeadbeef', 'join, dead token'],
    ['/magic-link/verify?token=deadbeef', 'magic-link, dead token'],
    ['/workspace/invite/accept', 'invite accept, NO token'],
    ['/workspace/invite/accept?token=deadbeef', 'invite accept, dead token'],
    ['/workspace/invite/accept?token=deadbeef&x=1', 'invite accept, token + extra param'],
    ['/invite?token=deadbeef', 'invite, dead token'],
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
        const nodes = [...document.querySelectorAll(sel)].filter(v);
        const withText = nodes.map(e => ((e.getAttribute('aria-label')||'') + '|' + (e.innerText||'')).replace(/\s+/g,' ').replace(/^\||\|$/g,'').trim()).filter(Boolean);
        return { landedOn: location.pathname + (location.search ? '?…' : ''),
                 allNodes: nodes.length, withText: [...new Set(withText)].length,
                 controls: [...new Set(withText)].slice(0,6),
                 text: (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,80) };
      });
      out.push({ label, requested: path.split('?')[0] + (path.includes('?') ? '?…' : ''), ...r });
    } catch (e) { out.push({ label, err: String(e).slice(0,50) }); }
    await p.close();
  }
  return out;
};
