export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage(); const out={};
  try {
    await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(x=>((x.getAttribute('aria-label')||x.innerText||'').trim())==='Language');
      if(b) b.click();
    });
    await page.waitForTimeout(1600);
    out.picked = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const el=[...document.querySelectorAll('button,a,li,[role]')].filter(vis)
        .find(x=>((x.innerText||'').trim())==='Uzbek (Cyrillic)');
      if(!el) return false; el.click(); return true;
    });
    await page.waitForTimeout(2500);
    const routes={
      login:'/login', signup:'/signup', forgot:'/forgot-password',
      reset:'/reset-password?token=qa-probe-invalid',
      verify:'/auth/verify-email?token=qa-probe-invalid',
      magic:'/magic-link/verify?token=qa-probe-invalid'};
    const found={};
    for (const [n,u] of Object.entries(routes)) {
      await page.goto('https://airion-cargo.store'+u, {waitUntil:'domcontentloaded'}).catch(()=>{});
      await page.waitForTimeout(2200);
      const r = await page.evaluate(() => {
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const skip=/Aloqa|Google|@|http|v0\.|API/;
        const res=[]; const w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while((n=w.nextNode())){
          const t=(n.textContent||'').trim();
          if(t.length<4) continue;
          const p=n.parentElement; if(!p||!vis(p)) continue;
          if(/[Ѐ-ӿ]/.test(t)) continue;
          if(!/[A-Za-z]{4,}/.test(t)) continue;
          if(skip.test(t)) continue;
          res.push(t.replace(/\s+/g,' ').slice(0,54));
        }
        return { latin:[...new Set(res)].slice(0,6),
                 cyrillicPresent: /[Ѐ-ӿ]/.test(document.body.innerText||'') };
      });
      found[n]=r;
    }
    out.routes = found;
  } finally { await ctx.close(); }
  return out;
};
