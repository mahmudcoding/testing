const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const out={};
  try {
    for (const [key,url] of [
      ['accept, NO params',        'https://airion-cargo.store/workspace/invite/accept'],
      ['accept, ?token=dead',      'https://airion-cargo.store/workspace/invite/accept?token=not-a-real-token-000'],
      ['accept, ?token=&extra',    'https://airion-cargo.store/workspace/invite/accept?token=not-a-real-token-000&x=1'],
      ['invite, ?token=dead',      'https://airion-cargo.store/invite?token=not-a-real-token-000'],
    ]) {
      await page.goto(url, { waitUntil:'networkidle' });
      await page.waitForTimeout(2400);
      out[key] = await page.evaluate(`(() => { const vis=(${VIS});
        const b=document.body;
        const all=[...b.querySelectorAll('button,a[href],input,select,textarea,summary,details,[role=switch],[role=button],[role=link],[role=tab],[onclick],[tabindex]')]
          .filter(vis);
        const byTag={};
        for (const e of all){ const k=e.tagName.toLowerCase(); byTag[k]=(byTag[k]||0)+1; }
        const withText=all.filter(e=>((e.innerText||e.getAttribute('aria-label')||'').trim().length>0)).length;
        return { landedOn: location.pathname + location.search,
                 text:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,110),
                 wideTotal: all.length, withVisibleText: withText, byTag }; })()`);
    }
  } finally { await ctx.close(); }
  return out;
};
