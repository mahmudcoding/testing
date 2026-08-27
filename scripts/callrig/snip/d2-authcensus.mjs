const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const out={};
  const paths=['/login','/signup','/forgot-password','/magic-link','/company/create',
               '/reset-password','/verify-email','/accept-invite'];
  for (const path of paths) {
    const codes=[];
    const h=r=>{ if(r.status()>=400) codes.push(`${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,40)}`); };
    p.on('response', h);
    await p.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await p.waitForTimeout(2000);
    p.off('response', h);
    out[path] = await p.evaluate(`(() => { const vis=(${VIS});
      const body=(document.body.innerText||'').replace(/\\s+/g,' ').trim();
      return { url:location.pathname, chars:body.length, text:body.slice(0,190),
        controls:[...document.querySelectorAll('button,input,select,textarea,a[href]')].filter(vis)
          .map(e=>({ tag:e.tagName.toLowerCase(), type:e.getAttribute('type')||'',
                     name:e.getAttribute('name')||'',
                     t:((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,28),
                     href:(e.getAttribute('href')||'').slice(0,26),
                     dis:e.disabled===true })),
        headings:[...document.querySelectorAll('h1,h2,h3,[role=heading]')].filter(vis)
          .map(e=>(e.innerText||'').trim().slice(0,40)) }; })()`);
    out[path].errors = codes.slice(0,3);
  }
  await ctx.close();
  return out;
};
