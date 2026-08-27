const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const all=[...document.querySelectorAll('input,textarea,[contenteditable="true"],[role=searchbox],[role=combobox]')];
    return { total:all.length,
      inputs: all.map(e=>({ tag:e.tagName.toLowerCase(), type:e.getAttribute('type')||'',
        ph:e.getAttribute('placeholder')||'', al:(e.getAttribute('aria-label')||'').slice(0,34),
        role:e.getAttribute('role')||'', visible:vis(e),
        x:Math.round(e.getBoundingClientRect().x), y:Math.round(e.getBoundingClientRect().y) })),
      bodyMentionsFilter:/Filter settings/i.test(document.body.innerText||''),
      viewport:[innerWidth,innerHeight] }; })()`);
};
