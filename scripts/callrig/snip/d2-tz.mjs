export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(!u.includes('/api/v1/')) return;
    let b=''; try{b=(await r.text()).slice(0,400);}catch{}
    net.push({m:r.request().method(),u:u.replace(/^https?:\/\/[^/]+/,''),s:r.status(),req:(r.request().postData()||'').slice(0,300),res:b}); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const sw = page.locator('[role=switch]').filter({ hasText: '' });
  const h = await page.evaluateHandle(() => [...document.querySelectorAll('main [role=switch]')].find(e => {
    let n = e.parentElement; for (let i=0;i<4&&n;i++){ if(/Show timezone/.test(n.innerText||'')) return true; n=n.parentElement; } return false; }) || null);
  const el = h.asElement(); if (!el) return { err: 'Show timezone switch not found' };
  await el.scrollIntoViewIfNeeded();
  const before = await el.evaluate(e => e.getAttribute('aria-checked'));
  net.length = 0;
  await el.click(); await page.waitForTimeout(1200);
  const afterClick = await el.evaluate(e => e.getAttribute('aria-checked'));
  const save = page.locator('button:has-text("Save profile")').first();
  const hadSave = await save.count();
  if (hadSave) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(3500); }
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  const persisted = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials:'include' }); const j = await r.json();
    const u = j.user || j; return (u.settings && u.settings.profile) || {};
  });
  const afterReload = await page.evaluate(() => { const e=[...document.querySelectorAll('main [role=switch]')].find(x=>{
    let n=x.parentElement; for(let i=0;i<4&&n;i++){ if(/Show timezone/.test(n.innerText||'')) return true; n=n.parentElement; } return false; });
    return e ? e.getAttribute('aria-checked') : '(missing)'; });
  return { switchBefore: before, afterClick, afterReload, hadSaveButton: hadSave,
           requests: net.filter(n=>n.m!=='GET').map(n=>`${n.m} ${n.u} -> ${n.s}`),
           body: net.filter(n=>n.req).map(n=>n.req)[0]||'', profileSettings: persisted };
};
