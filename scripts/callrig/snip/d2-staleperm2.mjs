const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const STATE = `() => { const vis=(${VIS});
  const main=document.querySelector('main')||document.body;
  const items=[...main.querySelectorAll('button')].filter(vis)
    .map(b=>(b.innerText||'').trim()).filter(Boolean).filter(t=>!/Filter/.test(t));
  const t=(main.innerText||'');
  return { buttons: items.slice(0,6), rows:(main.querySelectorAll('tr')||[]).length,
           denied:/do not have permission|Admin access required/i.test(t) }; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  return { openedState: await page.evaluate(`(${STATE})()`) };
};
