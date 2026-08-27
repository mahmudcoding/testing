const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01', DAVE='U4QDDAVE0000001';
  // dave opens a settings page in his own context
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1400);
  await p.fill('input[name="email"]','qa.d.dave@aloqa.test');
  await p.fill('input[name="password"]','QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  await p.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await p.waitForTimeout(2600);
  const before = await p.evaluate(`(() => ({ url:location.pathname,
    chars:(document.body.innerText||'').length }))()`);
  // owner removes dave from the WORKSPACE (not the company)
  const removal = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', DAVE='U4QDDAVE0000001';
    const r=await fetch('/api/v1/workspaces/kick',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({workspace_id:W, user_id:DAVE})});
    return { s:r.status, b:(await r.text()).slice(0,160) };
  });
  await p.waitForTimeout(2500);
  // dave's still-open page: interact
  const apiNow = await p.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const a=await fetch('/api/v1/auth/me',{credentials:'include'});
    const c=await fetch(`/api/v1/workspaces/${W}/channels`,{credentials:'include'});
    return { authMe:a.status, channels:c.status }; });
  await p.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/appearance"]')].filter(vis)[0]; if(a) a.click(); })()`);
  await p.waitForTimeout(3500);
  const afterNav = await p.evaluate(`(() => { const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, chars:t.length, head:t.slice(0,130),
      looksBroken:/undefined|null|NaN|\\[object/i.test(t), onLogin:/Sign in to Aloqa/i.test(t) }; })()`);
  await p.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await p.waitForTimeout(3000);
  const afterReload = await p.evaluate(`(() => { const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, head:t.slice(0,130), looksBroken:/undefined|null|NaN/i.test(t) }; })()`);
  await ctx.close();
  return { before, removal, apiAfterRemoval:apiNow, afterInAppNav:afterNav, afterReload };
};
