const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const WANT = process.env.D2_WANT; // 'off' or 'on'
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/presence|auth|privacy/i.test(u)) return;
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,46)} -> ${r.status()} ${(r.request().postData()||'').slice(0,80)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main [role=switch]')].filter(vis).find(e=>{ let n=e.parentElement,box=null;
      for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
      return ((box?box.innerText:'')||'').includes('Show online status'); }) || null; })()`);
  const el = h.asElement(); if (!el) return { err:'switch not found' };
  await el.scrollIntoViewIfNeeded();
  const before = await el.evaluate(e=>e.getAttribute('aria-checked'));
  const want = WANT === 'off' ? 'false' : 'true';
  if (before !== want) { await el.click(); await page.waitForTimeout(2500); }
  const after = await el.evaluate(e=>e.getAttribute('aria-checked'));
  const server = await page.evaluate(async () => {
    const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json(); const u=j.user||j;
    return { presence:u.presence, online_visibility:((u.settings||{}).privacy||{}).online_visibility }; });
  return { switchBefore: before, switchAfter: after, requests: net, server };
};
