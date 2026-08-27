const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  return await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox]')].filter(vis)
      .map(e=>{ let l=e.getAttribute('aria-label')||'';
        if(!l){ let p=e.parentElement; for(let i=0;i<4&&p;i++){ if(p.querySelectorAll('button,input,select,[role=combobox]').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<60){l=t.replace(/\\n/g,' | ');break;} } p=p.parentElement; } }
        if(!l) l=(e.innerText||'').trim()||e.getAttribute('placeholder')||'(unlabelled)';
        return { tag:e.tagName.toLowerCase(), label:l.slice(0,46),
                 disabled: e.disabled===true||e.getAttribute('aria-disabled')==='true' }; }); })()`);
};
