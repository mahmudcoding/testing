const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  // signed-out context: these are pre-auth routes
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const out={};
  try {
    for (const [key,url] of [
        ['magic-link/verify (no token)',  'https://airion-cargo.store/magic-link/verify'],
        ['magic-link/verify (bad token)', 'https://airion-cargo.store/magic-link/verify?token=not-a-real-token-000'],
        ['join/[token] (bad token)',      'https://airion-cargo.store/join/not-a-real-token-000'],
        ['auth/verify-email (bad token)', 'https://airion-cargo.store/auth/verify-email?token=not-a-real-token-000']]) {
      const resp = await page.goto(url, { waitUntil:'networkidle' }).catch(()=>null);
      await page.waitForTimeout(2200);
      out[key] = await page.evaluate(`(() => { const vis=(${VIS});
        const b=document.body;
        const t=(b.innerText||'').replace(/\\s+/g,' ').trim();
        const ctl=[...b.querySelectorAll('button,a[href],input')].filter(vis)
          .map(e=>(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').replace(/\\s+/g,' ').trim().slice(0,28)).filter(Boolean);
        return { landedOn: location.pathname+location.search.slice(0,40), text: t.slice(0,220),
                 controls: ctl.slice(0,8), controlCount: ctl.length }; })()`);
      out[key].httpStatus = resp ? resp.status() : 'nav-failed';
    }
  } finally { await ctx.close(); }
  return out;
};
