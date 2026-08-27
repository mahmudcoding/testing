const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LAYOUT = `() => {
  const boxes = [];
  const walk = (el, d) => { if (d > 6) return; for (const c of el.children) {
    const r = c.getBoundingClientRect();
    if (r.height > 400 && r.width > 40 && r.width < 700) boxes.push({ tag: c.tagName.toLowerCase(),
      cls: (c.className||'').toString().slice(0,28), x: Math.round(r.x), w: Math.round(r.width) });
    walk(c, d + 1); } };
  walk(document.body, 0);
  const main = document.querySelector('main'); const mr = main ? main.getBoundingClientRect() : null;
  return { innerWidth: window.innerWidth, columns: boxes.slice(0, 8),
           main: mr ? { x: Math.round(mr.x), w: Math.round(mr.width) } : null };
}`;
export default async ({ page }) => {
  const CH = 'https://airion-cargo.store/w/W4QDF1XTURESO01/c/C4QDGENERAL0001';
  const AP = 'https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance';
  await page.goto(CH, { waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  const before = await page.evaluate(`(${LAYOUT})()`);

  await page.goto(AP, { waitUntil: 'networkidle' }); await page.waitForTimeout(2200);
  const pick = async lbl => { const h = await page.evaluateHandle(`(() => { const vis = ${VIS};
      const all=[...document.querySelectorAll('main button')].filter(vis);
      return all.find(b => (b.innerText||'').trim() === ${JSON.stringify('X')}) || all.find(b => { let p=b.parentElement;
        for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button').length===1 && (p.innerText||'').trim().startsWith(${JSON.stringify(lbl)})) return true; p=p.parentElement; } return false; })
        || all.find(b => (b.innerText||'').trim() === ${JSON.stringify(lbl)}) || null; })()`);
    return h.asElement(); };
  const right = await pick('Right');
  if (!right) return { err: 'Right not found' };
  await right.scrollIntoViewIfNeeded(); await right.click(); await page.waitForTimeout(1500);
  const checked = await right.evaluate(e => e.getAttribute('aria-checked'));
  const onAppearance = await page.evaluate(`(${LAYOUT})()`);

  await page.goto(CH, { waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  const afterNav = await page.evaluate(`(${LAYOUT})()`);
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  const afterReload = await page.evaluate(`(${LAYOUT})()`);
  const stillChecked = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials:'include' }); const j = await r.json();
    const u = j.user||j; return { settingsKeys: Object.keys(u.settings||{}), appearance: (u.settings||{}).appearance || null };
  });
  const storage = await page.evaluate(() => { const o = {};
    for (let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
      if (/appearance|theme|sidebar|density|accent|layout/i.test(k)) o[k]=(localStorage.getItem(k)||'').slice(0,120); } return o; });
  return { channelBefore: before, onAppearanceAfterClick: onAppearance, rightChecked: checked,
           channelAfterSetting: afterNav, channelAfterReload: afterReload, authMeSettings: stillChecked, storage };
};
