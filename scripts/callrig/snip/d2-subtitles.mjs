const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W = 'W4QDF1XTURESO01';
  const pages = [
    ['Admin → Workspaces', `/w/${W}/settings/admin/workspaces`],
    ['Admin → Company dashboard', `/w/${W}/settings/admin/company`],
    ['About', `/w/${W}/settings/about`]
  ];
  const out = [];
  for (const [name, path] of pages) {
    await page.goto('https://airion-cargo.store' + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const r = await page.evaluate(`(() => { const vis = ${VIS};
      const main = document.querySelector('main')||document.body;
      const txt = (main.innerText||'');
      // content begins at the last breadcrumb separator
      const i = txt.lastIndexOf('›');
      const content = (i>=0 ? txt.slice(i+1) : txt).replace(/\\n+/g,' | ').trim().slice(0,400);
      // interactive elements that are NOT settings-nav links
      const navHrefs = new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
      const items = [...main.querySelectorAll('a,button,[role=switch],[role=button],input,select')].filter(vis)
        .filter(e => !(e.tagName==='A' && navHrefs.has(e.getAttribute('href'))))
        .map(e => (e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,40))
        .filter(Boolean);
      return { content, interactive: items.slice(0,14), interactiveCount: items.length }; })()`);
    out.push({ page: name, ...r });
  }
  return out;
};
