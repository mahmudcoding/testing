const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,52); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  const inputs = await page.evaluate(`(() => { const vis=(${VIS}); const lbl=(${LBL});
    return [...document.querySelectorAll('main input')].filter(vis)
      .map((e,i)=>({ i, label: lbl(e), type:e.type, placeholder:e.getAttribute('placeholder')||'', val:String(e.value).slice(0,20) })); })()`);
  const nameIdx = inputs.findIndex(x => /Role name/i.test(x.label));
  if (nameIdx < 0) return { err:'Role name input not found', inputs };
  const pick = async i => (await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis)[${i}]; })()`)).asElement();
  const nameEl = await pick(nameIdx);
  await nameEl.scrollIntoViewIfNeeded(); await nameEl.fill('D2 wildcard probe'); await page.waitForTimeout(400);
  const wcIdx = inputs.findIndex(x => /All company permissions/i.test(x.label));
  const wcEl = await pick(wcIdx);
  await wcEl.scrollIntoViewIfNeeded();
  if (!(await wcEl.evaluate(e=>e.checked===true))) { await wcEl.click(); await page.waitForTimeout(600); }
  const btn = page.locator('main button:has-text("Create role")').first();
  const btnState = { count: await btn.count(), disabled: (await btn.count()) ? await btn.isDisabled() : null };
  const net=[]; const on = async r => { if(!r.url().includes('/api/v1/')||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,300);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b}`); };
  page.on('response', on);
  if (btnState.count && !btnState.disabled) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(4000); }
  page.off('response', on);
  const stored = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const r=await fetch(`/api/v1/companies/${CO}/roles`,{credentials:'include'}); const j=await r.json();
    const arr=Array.isArray(j)?j:(j.roles||[]); const t=arr.find(x=>x.name==='D2 wildcard probe');
    if(!t) return '(not created)';
    const d=await fetch(`/api/v1/companies/roles/${t.id}`,{credentials:'include'});
    let det=null; try{det=await d.json();}catch{}
    return { id:t.id, listPerms:t.permissions||null, detailStatus:d.status, detailPerms: det&&(det.permissions||det.role&&det.role.permissions)||null };
  });
  return { inputsFound: inputs.map(x=>x.i+':'+x.label), createButton: btnState, requests: net, stored };
};
