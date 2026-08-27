const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/session|auth/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b.slice(0,90)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/sessions', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(async () => {
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'}); const j=await r.json();
    return (Array.isArray(j)?j:(j.sessions||j.items||[])).length; });
  let notices=[];
  const poll=setInterval(async()=>{ try{ const n=await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean); })()`); if(n.length>notices.length) notices=n; }catch{} },250);
  net.length=0;
  const btn = page.locator('button:has-text("Sign out other sessions")').first();
  const found = await btn.count();
  if (found) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(2500);
    // possible confirm dialog
    for (const sel of ['[role=dialog] button:has-text("Sign out")','[role=alertdialog] button:has-text("Sign out")']) {
      const c=page.locator(sel).last(); if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(3000); break; } }
    await page.waitForTimeout(3000); }
  clearInterval(poll);
  const after = await page.evaluate(async () => {
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'}); if(r.status!==200) return 'status '+r.status;
    const j=await r.json(); return (Array.isArray(j)?j:(j.sessions||j.items||[])).length; });
  const stillMe = await page.evaluate(async () => (await fetch('/api/v1/auth/me',{credentials:'include'})).status);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,6); })()`);
  return { sessionsBefore: before, buttonFound: found, requests: net, notices,
           sessionsAfter: after, ownSessionStillValid: stillMe, controlsNow: ui };
};
