const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    return [...main.querySelectorAll('button,a')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .map(e=>({ tag:e.tagName.toLowerCase(),
                 innerText:(e.innerText||'').trim().replace(/\\n/g,' | ').slice(0,40),
                 aria:(e.getAttribute('aria-label')||'').slice(0,40),
                 href:(e.getAttribute('href')||'').slice(0,50),
                 dis:e.disabled===true })); })()`);
};
