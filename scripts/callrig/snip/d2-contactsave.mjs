export default async ({ page }) => {
  const net = [];
  page.on('response', async r => {
    const u = r.url(); if (!u.includes('/api/v1/')) return;
    let b = ''; try { b = (await r.text()).slice(0, 400); } catch {}
    net.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), req: (r.request().postData() || '').slice(0, 300), res: b });
  });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const fields = [
    ['input[placeholder="+1 555 0100"]', '+998 90 123 4567'],
    ['input[placeholder="https://linkedin.com/in/username"]', 'https://linkedin.com/in/qa-probe'],
    ['input[placeholder="https://github.com/username"]', 'https://github.com/qa-probe'],
    ['input[placeholder="https://example.com"]', 'https://example.org/qa']
  ];
  for (const [sel, v] of fields) { const l = page.locator(sel); await l.scrollIntoViewIfNeeded(); await l.fill(v); await page.waitForTimeout(150); }

  // watch toasts from before the click
  let maxToast = [];
  const poll = setInterval(async () => {
    try {
      const t = await page.evaluate(() => {
        const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
          let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
            if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; };
        return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],li')].filter(vis)
          .map(e => e.innerText.trim()).filter(s => s && s.length < 160);
      });
      if (t.length > maxToast.length) maxToast = t;
    } catch {}
  }, 250);

  net.length = 0;
  const save = page.locator('button:has-text("Save changes")');
  await save.scrollIntoViewIfNeeded(); await save.click();
  await page.waitForTimeout(4000);
  clearInterval(poll);

  const afterSave = net.filter(n => n.m !== 'GET' || n.u.includes('me'));

  // reload and read back
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);
  const readback = await page.evaluate(() => {
    const g = p => { const e = document.querySelector(`input[placeholder="${p}"]`); return e ? e.value : '(field missing)'; };
    return { phone: g('+1 555 0100'), linkedin: g('https://linkedin.com/in/username'), github: g('https://github.com/username'), site: g('https://example.com') };
  });
  const me = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' }); const j = await r.json();
    const u = j.user || j; const out = {};
    for (const k of Object.keys(u)) if (/phone|link|git|web|site|url|contact|social/i.test(k)) out[k] = u[k];
    return out;
  });
  return { toast: maxToast, saveRequests: afterSave.map(n => `${n.m} ${n.u} -> ${n.s}`), reqBody: afterSave.map(n => n.req).find(Boolean) || '', readbackAfterReload: readback, meContactFields: me };
};
