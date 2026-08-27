export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const out={};
  try {
    for (const [name,url] of [
      ['reset-password','https://airion-cargo.store/reset-password?token=qa-invalid-token-probe'],
      ['magic-link',    'https://airion-cargo.store/magic-link/verify?token=qa-invalid-token-probe'],
      ['verify-email',  'https://airion-cargo.store/auth/verify-email?token=qa-invalid-token-probe']]) {
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(3200);
      out[name] = await page.evaluate(() => {
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const t=(document.body.innerText||'').replace(/\s+/g,' ');
        return { url: location.pathname,
          text: t.slice(0,190),
          passwordFields: [...document.querySelectorAll('input[type=password]')].filter(vis).length,
          controls: [...document.querySelectorAll('button,a')].filter(vis)
            .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,8) };
      });
    }
  } finally { await ctx.close(); }
  return out;
};
