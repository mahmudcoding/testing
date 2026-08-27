const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return; const u=r.url();
    if(!/status|settings|profile/i.test(u)) return; let b=''; try{b=(await r.text()).slice(0,180);}catch{}
    net.push(`${r.request().method()} ${u.replace(/^https?:\/\/[^/]+/,'').slice(0,42)} -> ${r.status()} req=${(r.request().postData()||'').slice(0,90)}`); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out={};
  out.before = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return u.custom_status ?? '(none)'; });
  const btn = page.locator('button:has-text("Vacation")').first();
  out.found = await btn.count();
  if (out.found) {
    await btn.scrollIntoViewIfNeeded();
    out.pressedBefore = await btn.evaluate(e=>e.getAttribute('aria-checked'));
    await btn.click(); await page.waitForTimeout(1500);
    out.pressedAfter = await btn.evaluate(e=>e.getAttribute('aria-checked'));
    out.statusMessageField = await page.evaluate(`(() => { const vis=(${VIS});
      const ins=[...document.querySelectorAll('main input,main textarea')].filter(vis);
      const e=ins.find(x=>{ let l=x.getAttribute('aria-label')||'';
        if(!l&&x.id){const y=document.querySelector('label[for="'+CSS.escape(x.id)+'"]'); if(y) l=y.innerText.trim();}
        return /Status message/i.test(l); });
      return e?String(e.value):'(field missing)'; })()`);
  }
  net.length=0;
  const save = page.locator('button:has-text("Save profile")').first();
  if (await save.count()) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(5000); }
  out.requests = net;
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2500);
  out.after = await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    return u.custom_status ?? '(none)'; });
  return out;
};
