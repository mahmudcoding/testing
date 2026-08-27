const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const AP = 'https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance';
  await page.goto(AP, { waitUntil: 'networkidle' }); await page.waitForTimeout(2800);
  // label every switch by its own single-switch container
  const list = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('main [role=switch]')].filter(vis).map((e,i) => { let n=e.parentElement, box=null;
      for(let k=0;k<6&&n;k++){ if(n.querySelectorAll('[role=switch]').length===1) box=n; else break; n=n.parentElement; }
      return { i, text: ((box?box.innerText:'')||'').replace(/\\n/g,' | ').slice(0,60), checked: e.getAttribute('aria-checked') }; }); })()`);
  const out = [];
  for (const item of list) {
    const h = await page.evaluateHandle(`(() => { const vis = ${VIS};
      return [...document.querySelectorAll('main [role=switch]')].filter(vis)[${item.i}]; })()`);
    const el = h.asElement();
    await el.scrollIntoViewIfNeeded();
    const before = await el.evaluate(e => e.getAttribute('aria-checked'));
    const storedBefore = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'');
    await el.click(); await page.waitForTimeout(1100);
    const after = await el.evaluate(e => e.getAttribute('aria-checked'));
    const storedAfter = await page.evaluate(() => localStorage.getItem('aloqa.appearance')||'');
    // flip back
    await el.click(); await page.waitForTimeout(900);
    const restored = await el.evaluate(e => e.getAttribute('aria-checked'));
    out.push({ label: item.text.split(' | ')[0], before, after, restored,
               flips: before !== after, storeChanged: storedBefore !== storedAfter });
  }
  return out;
};
