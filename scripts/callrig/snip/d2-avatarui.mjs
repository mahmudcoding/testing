const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01'; const out={};
  for (const [name,p] of [['account',`/w/${W}/settings/account`],['company',`/w/${W}/settings/company`],['workspace',`/w/${W}/settings/workspace`]]) {
    await page.goto('https://airion-cargo.store'+p, { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    out[name] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const fileInputs=[...main.querySelectorAll('input[type=file]')].map(e=>({
        accept:e.getAttribute('accept')||'(none)', multiple:e.multiple, visible:(${VIS})(e),
        name:e.getAttribute('name')||'', id:e.id||'' }));
      const btns=[...main.querySelectorAll('button')].filter(vis)
        .filter(b=>/upload|image|avatar|photo|logo/i.test((b.innerText||'')+(b.getAttribute('aria-label')||'')))
        .map(b=>({ t:(b.innerText||'').trim().slice(0,26), aria:(b.getAttribute('aria-label')||'').slice(0,26), dis:b.disabled===true }));
      return { fileInputs, uploadButtons: btns }; })()`);
  }
  return out;
};
