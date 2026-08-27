const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', DAVE='U4QDDAVE0000001';
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1400);
  await p.fill('input[name="email"]','qa.d.dave@aloqa.test');
  await p.fill('input[name="password"]','QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  await p.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await p.waitForTimeout(2500);
  const removal = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', DAVE='U4QDDAVE0000001';
    const r=await fetch('/api/v1/companies/kick',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({company_id:CO, user_id:DAVE})});
    return { s:r.status, b:(await r.text()).slice(0,150) }; });
  await p.waitForTimeout(2500);
  const api = await p.evaluate(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});return r.status;};
    return { authMe: await g('/api/v1/auth/me'),
             companies: await g('/api/v1/users/me/companies'),
             workspaces: await g('/api/v1/users/me/workspaces') }; });
  const listed = await p.evaluate(async () => {
    const c=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).text();
    const w=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).text();
    return { companies:c.slice(0,120), workspaces:w.slice(0,180) }; });
  await p.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/appearance"]')].filter(vis)[0]; if(a) a.click(); })()`);
  await p.waitForTimeout(3500);
  const afterNav = await p.evaluate(`(() => { const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, head:t.slice(0,150), chars:t.length,
      looksBroken:/undefined|null|NaN|\\[object/i.test(t), onLogin:/Sign in to Aloqa/i.test(t) }; })()`);
  await p.goto(`https://airion-cargo.store/`, { waitUntil:'networkidle' });
  await p.waitForTimeout(3000);
  const atRoot = await p.evaluate(`(() => { const t=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { url:location.pathname, head:t.slice(0,180), looksBroken:/undefined|null|NaN/i.test(t) }; })()`);
  await ctx.close();
  return { removal, apiStatuses:api, listed, afterInAppNav:afterNav, atRoot };
};
