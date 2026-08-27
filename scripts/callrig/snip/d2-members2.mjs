const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const out = {};
  for (const path of ['/settings/admin/members', '/settings/members', '/settings/admin']) {
    await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01' + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2800);
    const r = await page.evaluate(`(() => { const vis = ${VIS};
      const main = document.querySelector('main')||document.body;
      const heads=[...main.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.innerText.trim().slice(0,44));
      const ctrls=[...main.querySelectorAll('button,a,input,select,[role=switch],[role=combobox]')].filter(vis)
        .map(e=>({ t:e.tagName.toLowerCase(), lbl:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().replace(/\\s+/g,' ').slice(0,46), dis:e.disabled===true||e.getAttribute('aria-disabled')==='true' }));
      const uniq = []; const seen = new Set();
      for (const c of ctrls) { const k=c.t+'|'+c.lbl; if(!seen.has(k)){seen.add(k); uniq.push(c);} }
      return { path: location.pathname, heads, total: ctrls.length, distinct: uniq.slice(0,28),
               text: (main.innerText||'').replace(/\\s+/g,' ').slice(0,220) }; })()`);
    out[path] = r;
    if (r.heads.length && r.total > 3) break;
  }
  return out;
};
