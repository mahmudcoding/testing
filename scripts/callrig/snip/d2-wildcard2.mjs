const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l = e.getAttribute('aria-label')||'';
  if (!l && e.id) { const x=document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if(x) l=x.innerText.trim(); }
  if (!l) { let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } }
  return l.slice(0,52); }`;
const READ = `() => { const vis=(${VIS}); const lbl=(${LBL});
  return [...document.querySelectorAll('main input')].filter(vis)
    .filter(e => e.type==='checkbox' || String(e.value)==='on' || e.getAttribute('role')==='checkbox')
    .map((e,i) => ({ i, label: lbl(e), checked: e.checked===true, aria: e.getAttribute('aria-checked'), disabled: e.disabled===true })); }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  const initial = await page.evaluate(`(${READ})()`);
  if (!initial.length) {
    const probe = await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main input')].filter(vis).map(e=>({ type:e.type, val:String(e.value).slice(0,12),
        role:e.getAttribute('role')||'', aria:e.getAttribute('aria-label')||'', id:e.id||'' })).slice(0,14); })()`);
    return { err:'no checkboxes matched', probe };
  }
  const byLabel = async (frag, want) => {
    const idx = (await page.evaluate(`(${READ})()`)).findIndex(c => c.label.includes(frag));
    if (idx < 0) return 'not found: ' + frag;
    const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('main input')].filter(vis)
        .filter(e => e.type==='checkbox' || String(e.value)==='on' || e.getAttribute('role')==='checkbox')[${idx}]; })()`);
    const el = h.asElement(); await el.scrollIntoViewIfNeeded();
    const cur = await el.evaluate(e=>e.checked===true);
    if (want !== undefined && cur === want) return 'already';
    await el.click(); await page.waitForTimeout(600); return 'clicked';
  };
  const a = await byLabel('All company permissions', true);
  const afterWildcard = await page.evaluate(`(${READ})()`);
  await byLabel('All company permissions', false);
  const afterUn = await page.evaluate(`(${READ})()`);
  for (const c of initial) if (!c.label.includes('All company permissions')) await byLabel(c.label, true);
  const afterAll = await page.evaluate(`(${READ})()`);
  return { wildcardAction:a,
    initial: initial.map(c=>c.label+'='+c.checked),
    afterWildcardChecked: afterWildcard.map(c=>c.label+'='+c.checked+(c.disabled?'/DISABLED':'')),
    afterWildcardUnchecked: afterUn.map(c=>c.label+'='+c.checked),
    afterTickingAllIndividually: afterAll.map(c=>c.label+'='+c.checked) };
};
