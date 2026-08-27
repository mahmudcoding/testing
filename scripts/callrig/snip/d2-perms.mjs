// Enumerate permission checkboxes in the Create-role form, structurally:
// walk each checkbox up to its label container rather than sweeping `label`.
export default async ({page}) => {
  const scope = process.env.QA_SCOPE || 'company';
  await page.goto(`https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map(h=>h.innerText.trim());
    // the permissions fieldset: find the element whose text starts with PERMISSIONS
    const boxes = [...document.querySelectorAll('input[type=checkbox]')];
    const out = boxes.map((b,i) => {
      let lab = '';
      if (b.id) { const l = document.querySelector(`label[for="${CSS.escape(b.id)}"]`); if (l) lab = l.innerText; }
      if (!lab) { const l = b.closest('label'); if (l) lab = l.innerText; }
      if (!lab) { let p = b.parentElement; for (let k=0;k<4 && p && !lab;k++,p=p.parentElement) { const t=(p.innerText||'').trim(); if (t && t.length<120) lab = t; } }
      return {i, name: b.name||'', value: b.value||'', checked: b.checked,
              aria: b.getAttribute('aria-label')||'', label: (lab||'').replace(/\s+/g,' ').trim().slice(0,90)};
    });
    return {heads: heads.slice(0,8), count: boxes.length, perms: out};
  });
};
