const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=${scope}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    out[scope] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const labels=[...main.querySelectorAll('input[type=checkbox]')].filter(vis).map(cb=>{
        const lab=cb.closest('label')||cb.parentElement;
        return ((lab&&lab.innerText)||'').replace(/\\s+/g,' ').trim(); }).filter(Boolean);
      // a raw key looks like word.word or word.word.word, lowercase, with dots and no spaces
      const raw=labels.filter(l=>/^[a-z]+(\\.[a-z_]+)+$/.test(l.split(' ')[0]) || /^[a-z]+\\.[a-z_.]+$/.test(l));
      return { count:labels.length, labels, rawKeyLabels:raw }; })()`);
  }
  return out;
};
