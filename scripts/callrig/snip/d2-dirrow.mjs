const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const all=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>({tag:e.tagName.toLowerCase(), t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30),
                al:(e.getAttribute('aria-label')||'').slice(0,46), href:e.getAttribute('href')||'',
                y:Math.round(e.getBoundingClientRect().y)}));
    return { count:all.length, controls:all.slice(0,24),
      mentionsProfile: all.filter(o=>/profile/i.test(o.t+' '+o.al)).slice(0,6),
      pageText:(main.innerText||'').replace(/\\s+/g,' ').slice(0,260) }; })()`);
};
