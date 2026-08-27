export default async ({ browser }) => {
  const TOK='wWS6o2n4-h-y34y9KQ5CS-jM7XvQA80Ekl_TSTk8OB4=';
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const out={};
  try {
    // server behaviour first, from a clean context
    await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(1500);
    out.api = await page.evaluate(async (t) => {
      const r=await fetch('/api/v1/workspace-invites/accept',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({token:t})});
      return {s:r.status, t:(await r.text()).slice(0,260)};
    }, TOK);
    for (const u of [`/invite?token=${encodeURIComponent(TOK)}`, `/invite/${encodeURIComponent(TOK)}`]) {
      await page.goto('https://airion-cargo.store'+u, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(3500);
      out[u.split('?')[0].slice(0,12)+(u.includes('?')?'?q':'/p')] = await page.evaluate(() => {
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const t=(document.body.innerText||'').replace(/\s+/g,' ');
        return { url: location.pathname.slice(0,40)+location.search.slice(0,18),
          text: t.slice(0,220),
          controls: [...document.querySelectorAll('button,a')].filter(vis)
            .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,8) };
      });
    }
  } finally { await ctx.close(); }
  return out;
};
