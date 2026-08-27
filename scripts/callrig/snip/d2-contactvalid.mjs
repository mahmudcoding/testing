const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(!u.includes('/api/v1/')) return;
    net.push({m:r.request().method(),u:u.replace(/^https?:\/\/[^/]+/,'').slice(0,50),s:r.status(),req:(r.request().postData()||'').slice(0,220)}); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const cases = [
    ['+1 555 0100', 'abc', 'Phone'],
    ['https://linkedin.com/in/username', 'https://example.com/not-linkedin', 'LinkedIn'],
    ['https://github.com/username', 'https://example.com/not-github', 'GitHub'],
    ['https://example.com', 'notaurl', 'Website']
  ];
  const results = [];
  for (const [ph, bad, name] of cases) {
    const f = page.locator(`input[placeholder="${ph}"]`);
    await f.scrollIntoViewIfNeeded(); await f.fill(bad); await page.waitForTimeout(400);
    await f.blur(); await page.waitForTimeout(900);
    const near = await page.evaluate(`((ph) => { const vis = ${VIS};
      const inp = document.querySelector('input[placeholder="'+ph+'"]'); if(!inp) return '(no input)';
      let box = inp.parentElement;
      for (let i=0;i<4&&box;i++){ if(box.querySelectorAll('input').length===1) { const t=(box.innerText||'').trim(); if(t) return t.replace(/\\n/g,' | ').slice(0,140); } box=box.parentElement; }
      return '(no text)'; })(${JSON.stringify(ph)})`);
    const aria = await f.evaluate(e => ({ invalid: e.getAttribute('aria-invalid'), desc: e.getAttribute('aria-describedby') }));
    results.push({ field: name, entered: bad, textNearField: near, ariaInvalid: aria.invalid });
  }
  // now try to save with all four invalid
  net.length = 0;
  const save = page.locator('button:has-text("Save changes")').first();
  const saveExists = await save.count();
  let saveDisabled = null, afterSave = null;
  if (saveExists) { saveDisabled = await save.isDisabled();
    if (!saveDisabled) { await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(3000); }
    afterSave = net.filter(n=>n.m!=='GET').map(n=>`${n.m} ${n.u} -> ${n.s}`);
  }
  const storedNow = await page.evaluate(async () => { const r = await fetch('/api/v1/auth/me',{credentials:'include'});
    const j = await r.json(); const u=j.user||j; return (u.settings||{}).contacts; });
  return { perField: results, saveButtonPresent: saveExists, saveDisabled, saveRequests: afterSave, contactsOnServerNow: storedNow };
};
