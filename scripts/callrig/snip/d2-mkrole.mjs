// Create a role through the UI. QA_SCOPE, QA_ROLE, QA_DESC, QA_PERM (label substring, ; separated)
export default async ({page}) => {
  const scope = process.env.QA_SCOPE || 'workspace';
  const name  = process.env.QA_ROLE;
  const desc  = process.env.QA_DESC || 'QA second pass probe role';
  const perms = (process.env.QA_PERM||'').split(';').filter(Boolean);
  await page.goto(`https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);

  await page.fill('input[placeholder="e.g. Moderators"]', name);
  await page.fill('input[placeholder="What this role is for"]', desc);

  // tick the checkboxes whose own label matches
  const ticked = await page.evaluate((perms) => {
    const lab = b => {
      if (b.id) { const l = document.querySelector(`label[for="${CSS.escape(b.id)}"]`); if (l) return l.innerText.trim(); }
      const l = b.closest('label'); if (l) return l.innerText.trim();
      let p = b.parentElement; for (let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<120) return t;}
      return '';
    };
    const out = [];
    for (const b of document.querySelectorAll('input[type=checkbox]')) {
      const L = lab(b);
      if (perms.some(p => L.toLowerCase().includes(p.toLowerCase()))) { b.click(); out.push({label:L, checked:b.checked}); }
    }
    return out;
  }, perms);
  await page.waitForTimeout(600);

  const before = [];
  const on = r => { try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/')) before.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{} };
  page.on('response', on);
  const btn = page.locator('button[type=submit]:has-text("Create role")');
  const disabled = await btn.isDisabled();
  if (!disabled) await btn.click();
  await page.waitForTimeout(3500);
  const reqs = before.slice();
  page.off('response', on);

  const after = await page.evaluate(() => (document.body.innerText||'').replace(/\s+/g,' ').slice(0,1500));
  return {ticked, submitDisabled: disabled, reqs: reqs.filter(r=>/role/i.test(r)), pageAfter: after.slice(after.indexOf('ROLE PERMISSIONS')) || after.slice(0,600)};
};
