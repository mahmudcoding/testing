export default async ({ page }) => {
  const WS = 'W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/company-roles`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const out = { url: page.url() };
  const before = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;}).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,42)).filter(Boolean));
  out.buttons = before.slice(0, 22);
  for (const sel of ['button:has-text("Create role")','button:has-text("New role")','button:has-text("Add role")','button:has-text("Create")']) {
    const b = await page.$(sel);
    if (b) { await b.click().catch(()=>{}); await page.waitForTimeout(2000); out.clicked = sel; break; }
  }
  Object.assign(out, await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width>0 && r.height>0; };
    const boxes = [...document.querySelectorAll('input[type=checkbox],[role=checkbox],[role=switch]')].filter(vis);
    const lab = e => {
      const al = e.getAttribute('aria-label'); if (al) return al;
      let p = e.closest('label') || e.parentElement;
      for (let i=0;i<4&&p;i++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<90) return t;}
      return '(none)';
    };
    return { dialog: !!document.querySelector('[role=dialog]'), boxCount: boxes.length,
      perms: boxes.slice(0,40).map(b=>lab(b).replace(/\s+/g,' ').slice(0,64)) };
  }));
  return out;
};
