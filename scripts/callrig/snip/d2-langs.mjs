const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    // whatever renders the language choice: select, listbox, radios, or a menu button
    const selects=[...main.querySelectorAll('select')].filter(vis)
      .map(s=>({ name:s.name||s.id||'', options:[...s.options].map(o=>o.value+'|'+o.text) }));
    const combos=[...main.querySelectorAll('[role=combobox],[role=listbox],button[aria-haspopup]')].filter(vis)
      .map(b=>({ tag:b.tagName.toLowerCase(), role:b.getAttribute('role')||'',
                 text:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40) }));
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { selects, combos, mentionsLanguage:/Language/i.test(t),
             around:(t.match(/Language[^|]{0,120}/)||[])[0]||null }; })()`);
};
