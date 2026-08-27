const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const out={};
  const paths=['/auth/verify-email','/auth/verify-email?token=bogus123',
               '/magic-link/verify','/magic-link/verify?token=bogus123',
               '/invite','/invite/bogus123',
               '/reset-password','/reset-password?token=bogus123'];
  for (const path of paths) {
    await p.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await p.waitForTimeout(2400);
    out[path] = await p.evaluate(`(() => { const vis=(${VIS});
      const body=(document.body.innerText||'').replace(/\\s+/g,' ').trim();
      return { url:location.pathname+location.search, text:body.slice(0,200),
        is404:/Page not found/i.test(body),
        controls:[...document.querySelectorAll('button,a[href],input')].filter(vis)
          .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('name')||'<'+e.tagName.toLowerCase()+'>').slice(0,30)) }; })()`);
  }
  // Show password toggle on /login
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1600);
  await p.fill('input[name="password"]', 'SecretValue1!');
  const t0 = await p.evaluate(`(() => document.querySelector('input[name=password]').getAttribute('type'))()`);
  await p.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/Show password|Hide password/i.test((e.innerText||'')+(e.getAttribute('aria-label')||'')));
    if(b.length) b[0].click(); })()`);
  await p.waitForTimeout(900);
  const t1 = await p.evaluate(`(() => { const vis=(${VIS});
    const i=document.querySelector('input[name=password]');
    const b=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/Show password|Hide password/i.test((e.innerText||'')+(e.getAttribute('aria-label')||'')))[0];
    return { type:i.getAttribute('type'), value:i.value,
             label:b?((b.innerText||'').trim()||b.getAttribute('aria-label')):null }; })()`);
  await ctx.close();
  return { routes:out, showPassword:{ typeBefore:t0, afterToggle:t1 } };
};
