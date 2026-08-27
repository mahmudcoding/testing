const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;

const FP = `() => {
  const pick = (el) => { if (!el) return null; const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height),
            s.backgroundColor, s.color, s.fontSize, s.padding, s.gap, s.borderRadius].join('|'); };
  const root = getComputedStyle(document.documentElement);
  const vars = {};
  for (const sheet of [...document.styleSheets]) {
    try { for (const rule of [...sheet.cssRules]) {
      if (rule.selectorText === ':root' || rule.selectorText === 'html') {
        for (const p of [...rule.style]) if (p.startsWith('--')) vars[p] = root.getPropertyValue(p).trim();
      } } } catch {}
  }
  const out = { vars, htmlClass: document.documentElement.className.slice(0,120), theme: document.documentElement.getAttribute('data-theme') || '' };
  const sels = ['aside', 'nav', 'main', 'header', 'body', '[data-message-id]', 'button'];
  for (const s of sels) out[s] = pick(document.querySelector(s));
  return out;
}`;

export default async ({ page }) => {
  const diff = (a, b) => { const d = []; const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) { if (k === 'vars') continue; if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) d.push(k + ': ' + JSON.stringify(a[k]) + ' -> ' + JSON.stringify(b[k])); }
    const va = a.vars || {}, vb = b.vars || {};
    for (const k of new Set([...Object.keys(va), ...Object.keys(vb)])) if (va[k] !== vb[k]) d.push('var ' + k + ': ' + va[k] + ' -> ' + vb[k]);
    return d; };

  const targets = ['Right', 'Compact', 'Violet', 'Light navigation rail', 'Markdown preview panel', 'Show member roles'];
  const results = [];
  for (const label of targets) {
    await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    const h = await page.evaluateHandle(`(() => { const vis = ${VIS};
      const all = [...document.querySelectorAll('main button')].filter(vis);
      return all.find(b => (b.getAttribute('aria-label')||'').trim() === ${JSON.stringify(label)})
          || all.find(b => { let p=b.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button').length===1 && (p.innerText||'').trim().startsWith(${JSON.stringify(label)})) return true; p=p.parentElement; } return false; })
          || all.find(b => (b.innerText||'').trim() === ${JSON.stringify(label)}) || null; })()`);
    const el = h.asElement();
    if (!el) { results.push({ label, err: 'control not found' }); continue; }
    await el.scrollIntoViewIfNeeded();
    const stateBefore = await el.evaluate(e => e.getAttribute('aria-checked') ?? e.getAttribute('aria-pressed') ?? e.getAttribute('data-state') ?? '(none)');
    const before = await page.evaluate(`(${FP})()`);
    const reqs = [];
    const onReq = r => { if (r.url().includes('/api/v1/')) reqs.push(r.method() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 70)); };
    page.on('request', onReq);
    await el.click(); await page.waitForTimeout(1800);
    const stateAfter = await el.evaluate(e => e.getAttribute('aria-checked') ?? e.getAttribute('aria-pressed') ?? e.getAttribute('data-state') ?? '(none)');
    const save = page.locator('button:has-text("Save")').first();
    let savedVia = null;
    if (await save.count()) { const txt = await save.innerText(); await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(2500); savedVia = txt.trim().slice(0,20); }
    const after = await page.evaluate(`(${FP})()`);
    page.off('request', onReq);
    results.push({ label, stateBefore, stateAfter, savedVia, requests: [...new Set(reqs)].slice(0, 4), changes: diff(before, after).slice(0, 8) });
  }
  return results;
};
