export default async ({ page }) => {
  const CO = 'O4QDF1XTURESO01';
  await page.goto('https://airion-cargo.store/admin/roles', {waitUntil:'domcontentloaded'}).catch(()=>{});
  await page.waitForTimeout(2500);
  const u = page.url();
  // try the create-role dialog
  const btn = await page.$('button:has-text("Create role"), button:has-text("New role"), button:has-text("Add role")');
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1800); }
  return await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width>0 && r.height>0; };
    const boxes = [...document.querySelectorAll('input[type=checkbox],[role=checkbox],[role=switch]')].filter(vis);
    const lab = e => {
      const al = e.getAttribute('aria-label'); if (al) return al;
      const id = e.id; if (id) { const l = document.querySelector(`label[for="${CSS.escape(id)}"]`); if (l) return l.innerText.trim(); }
      let p = e.closest('label') || e.parentElement;
      for (let i=0;i<4 && p;i++,p=p.parentElement) { const t=(p.innerText||'').trim(); if (t && t.length<90) return t; }
      return '(no label)';
    };
    return { url: location.href, count: boxes.length,
      items: boxes.slice(0,40).map(b => ({ label: lab(b).replace(/\s+/g,' ').slice(0,70), value: b.value || b.getAttribute('data-value') || b.name || '' })) };
  });
};
