const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const NAMES = `() => { const vis=(${VIS});
  const t=(document.body.innerText||'');
  const hits=[...new Set((t.match(/QA Workspace D[^\\s|]*|D2 Renamed[^\\s|]*/g)||[]))];
  const main=document.querySelector('main')||document.body;
  const inp=[...main.querySelectorAll('input')].filter(vis).map(e=>String(e.value)).filter(Boolean);
  return { namesOnPage: hits, inputValues: inp.slice(0,3) }; }`;
export default async ({ page }) => {
  // act on whatever page is already open — no navigation
  const openNow = { url: page.url().replace(/^https?:\/\/[^/]+/,''), ...(await page.evaluate(`(${NAMES})()`)) };
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2800);
  const afterReload = await page.evaluate(`(${NAMES})()`);
  return { withoutReload: openNow, afterReload };
};
