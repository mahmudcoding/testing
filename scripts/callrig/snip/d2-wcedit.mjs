const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,52); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  // find the Edit button on the row for our probe role
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const btns=[...document.querySelectorAll('main button')].filter(vis).filter(b=>/^Edit$/.test((b.innerText||'').trim()));
    for (const b of btns) { let row=b.parentElement;
      for(let i=0;i<6&&row;i++){ if((row.innerText||'').includes('D2 wildcard probe')) { b.click(); return true; } row=row.parentElement; } }
    return false; })()`);
  await page.waitForTimeout(2500);
  const editForm = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const scope = d || document.querySelector('main');
    return { inDialog: !!d,
      boxes: [...scope.querySelectorAll('input')].filter(vis).filter(e=>e.type==='checkbox'||String(e.value)==='on')
        .map(e=>lbl(e)+'='+(e.checked===true)),
      nameValue: (() => { const n=[...scope.querySelectorAll('input')].filter(vis).find(e=>/Role name/i.test(lbl(e))); return n?n.value:'(none)'; })() }; })()`);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  // assign to alice and confirm the wildcard really confers audit.view
  const assign = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const r=await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'}); const j=await r.json();
    const arr=Array.isArray(j)?j:(j.roles||[]); const t=arr.find(x=>x.name==='D2 wildcard probe');
    if(!t) return '(role gone)';
    const a=await fetch('/api/v1/companies/roles/assign',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({role_id:t.id,user_id:ALICE})});
    return { assignStatus:a.status, roleId:t.id };
  });
  return { editClicked: clicked, editForm, assign };
};
