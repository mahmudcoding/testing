const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const path of [`/w/${W}/settings`, `/w/${W}/settings/`, `/settings`, `/w/${W}/settings/nosuchsection`]) {
    await page.goto('https://airion-cargo.store'+path, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    out[path] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      return { url:location.pathname, chars:body.length, head:body.slice(0,90),
        is404:/Page not found/i.test(document.body.innerText||''),
        navCount:[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).length }; })()`);
  }
  return out;
};
