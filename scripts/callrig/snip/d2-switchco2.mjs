const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out = {};
  out.myCompanies = await page.evaluate(async () => {
    const r = await fetch('/api/v1/users/me/companies', { credentials:'include' });
    if (r.status !== 200) return 'status '+r.status;
    const j = await r.json(); const a = j.companies||j.items||(Array.isArray(j)?j:[]);
    return a.map(c=>({ name:c.name, id:c.id.slice(-5) }));
  });
  const btn = page.locator('button[aria-label="Switch company"]').first();
  out.buttonFound = await btn.count();
  if (out.buttonFound) {
    await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(2500);
    out.dialog = await page.evaluate(`(() => { const vis=(${VIS});
      const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)
        .sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
      if(!d) return '(no dialog/menu opened)';
      const inter=[...d.querySelectorAll('*')].filter(vis).filter(e=>{
        const t=e.tagName.toLowerCase(); const r=e.getAttribute('role')||'';
        return t==='button'||t==='a'||t==='input'||['button','link','menuitem','option','radio'].includes(r); })
        .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                   text:(e.innerText||'').trim().replace(/\\n/g,' | ').slice(0,44),
                   dis:e.disabled===true||e.getAttribute('aria-disabled')==='true' }));
      return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,300), interactiveCount:inter.length, interactive:inter.slice(0,10) }; })()`);
    await page.keyboard.press('Escape').catch(()=>{});
  }
  return out;
};
