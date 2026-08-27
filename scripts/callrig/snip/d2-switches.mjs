export default async ({ page }) => {
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('main button[role=switch], main [role=switch], main button')].filter(vis)
      .filter(e => e.getAttribute('role')==='switch' || e.getAttribute('aria-checked')!==null || /^(on|off)$/.test(String(e.value)))
      .map(e => { let lbl = e.getAttribute('aria-label')||'';
        if (!lbl) { let n=e.parentElement; for(let i=0;i<4&&n;i++){ const t=(n.innerText||'').trim(); if(t&&t.length<90){lbl=t.replace(/\\n/g,' | ');break;} n=n.parentElement; } }
        return { label: lbl.slice(0,88), checked: e.getAttribute('aria-checked'), state: e.getAttribute('data-state'), value: String(e.value||'') }; }); })()`);
};
