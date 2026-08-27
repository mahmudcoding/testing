const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Create workspace$/.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(2000);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=dlg[0]||document.querySelector('main');
    return { dialogs:dlg.length,
      text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,340),
      fields:[...d.querySelectorAll('input,textarea,select')].filter(vis)
        .map(e=>({name:e.getAttribute('name')||'', type:e.getAttribute('type')||'',
                  ph:e.getAttribute('placeholder')||'', maxlen:e.getAttribute('maxlength')||''})),
      buttons:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>({t:(e.innerText||'').trim().slice(0,30), dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})) }; })()`);
};
