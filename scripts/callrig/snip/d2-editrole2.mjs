const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,52); }`;
export default async ({ page }) => {
  const NAME = 'D2 edit probe';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  // bind Edit to the nearest ancestor containing exactly ONE Edit button, then confirm that ancestor names our role
  const clicked = await page.evaluate(`(() => { const vis=(${VIS}); const NAME=${JSON.stringify('D2 edit probe')};
    const edits=[...document.querySelectorAll('main button')].filter(vis).filter(b=>(b.innerText||'').trim()==='Edit');
    for (const b of edits) {
      let box=b.parentElement, chosen=null;
      for (let i=0;i<6&&box;i++){ if (box.querySelectorAll('button').length && [...box.querySelectorAll('button')].filter(x=>(x.innerText||'').trim()==='Edit').length===1) chosen=box; else break; box=box.parentElement; }
      if (chosen && (chosen.innerText||'').includes(NAME)) { b.click(); return true; }
    }
    return false; })()`);
  await page.waitForTimeout(2800);
  const form = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const scope = d || document.querySelector('main');
    const nameInput=[...scope.querySelectorAll('input')].filter(vis).find(e=>/Role name/i.test(lbl(e)));
    const boxes=[...scope.querySelectorAll('input')].filter(vis).filter(e=>e.type==='checkbox'||String(e.value)==='on')
      .map(e=>lbl(e)+'='+(e.checked===true));
    return { inDialog: !!d, nameValue: nameInput?nameInput.value:'(no name field)', boxes }; })()`);
  return { editClicked: clicked, editForm: form };
};
