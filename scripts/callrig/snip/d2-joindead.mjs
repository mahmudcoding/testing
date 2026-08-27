const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const out={};
  try {
    for (const [key,url] of [
        ['join/BADTOKEN',            'https://airion-cargo.store/join/not-a-real-token-000'],
        ['invite?token=BAD',         'https://airion-cargo.store/invite?token=not-a-real-token-000'],
        ['magic-link/verify?bad',    'https://airion-cargo.store/magic-link/verify?token=bad-000']]) {
      await page.goto(url, { waitUntil:'networkidle' });
      await page.waitForTimeout(2500);
      out[key] = await page.evaluate(`(() => { const vis=(${VIS});
        const b=document.body;
        const wide=[...b.querySelectorAll('button,a[href],input,select,textarea,summary,details,[role=switch],[role=button],[role=link],[role=tab],[role=menuitem],[onclick],[tabindex]')]
          .filter(vis).map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
            text:(e.innerText||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,30),
            href:(e.getAttribute('href')||'').slice(0,40) }));
        const t=(b.innerText||'').replace(/\\s+/g,' ').trim();
        const sc=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
          return e.scrollHeight-e.clientHeight>40 && /auto|scroll/.test(s.overflowY) && vis(e);}).length;
        return { textFull: t, textChars: t.length, wide, wideCount: wide.length,
                 scrollers: sc, docScrolls: document.documentElement.scrollHeight > innerHeight }; })()`);
    }
  } finally { await ctx.close(); }
  return out;
};
