const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01';
  // 1. the lane browser sits on a settings page
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return { authMe:r.status, url:location.pathname }; });
  // 2. from a separate context, sign in as the same account and kill other sessions
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p2.waitForTimeout(1400);
  await p2.fill('input[name="email"]','qa.d.alice@aloqa.test');
  await p2.fill('input[name="password"]','QaPass123!');
  await p2.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p2.waitForTimeout(6500);
  await p2.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await p2.waitForTimeout(2600);
  const killed = await p2.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Sign out other sessions$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await p2.waitForTimeout(3500);
  await ctx.close();
  // 3. back in the lane browser: what does the still-open page do?
  const apiNow = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return { authMe:r.status }; });
  // interact: navigate within the app
  await page.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/appearance"]')].filter(vis)[0]; if(a) a.click(); })()`);
  await page.waitForTimeout(4000);
  const afterNav = await page.evaluate(`(() => { const vis=(${VIS});
    const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, chars:t.length, head:t.slice(0,140),
      looksBroken:/undefined|null|NaN|\\[object/i.test(t),
      onLogin:/Sign in to Aloqa/i.test(t),
      notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3) }; })()`);
  // 4. a hard reload
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const afterReload = await page.evaluate(`(() => { const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname+location.search, onLogin:/Sign in to Aloqa/i.test(t), head:t.slice(0,120) }; })()`);
  return { before, killedOtherSessions:killed, apiAfterKill:apiNow, afterInAppNav:afterNav, afterReload };
};
