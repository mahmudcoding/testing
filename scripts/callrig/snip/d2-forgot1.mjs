const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const out = {};
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1800);
  out.login = await p.evaluate(`(() => { const vis=(${VIS});
    return { links:[...document.querySelectorAll('a[href]')].filter(vis)
              .map(a=>({t:(a.innerText||'').trim().slice(0,40), href:a.getAttribute('href')})),
             buttons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,40)),
             text:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,300) }; })()`);
  // follow the reset entry point
  const href = (out.login.links.find(l=>/forgot|reset|password/i.test(l.t+' '+l.href))||{}).href;
  out.entryHref = href || null;
  if (href) {
    await p.goto(new URL(href,'https://airion-cargo.store').toString(), { waitUntil:'networkidle' });
    await p.waitForTimeout(1800);
    out.forgotPage = await p.evaluate(`(() => { const vis=(${VIS});
      return { url:location.pathname,
        controls:[...document.querySelectorAll('input,button,a[href]')].filter(vis)
          .map(e=>({tag:e.tagName.toLowerCase(), name:e.getAttribute('name')||'', type:e.getAttribute('type')||'',
                    t:(e.innerText||'').trim().slice(0,36), ph:e.getAttribute('placeholder')||''})),
        text:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,420) }; })()`);
  }
  await ctx.close();
  return out;
};
