const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/chat', { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button,[role=button],a[href]')].filter(vis)
      .map(e=>{const r=e.getBoundingClientRect(); return {
        t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
        al:(e.getAttribute('aria-label')||'').slice(0,44),
        x:Math.round(r.x), y:Math.round(r.y)};})
      .filter(o=>/profile|account|avatar|status|you|QA Alice|sign|Q$/i.test(o.t+' '+o.al) || (o.x<60 && o.y>600))
      .slice(0,20); })()`);
};
