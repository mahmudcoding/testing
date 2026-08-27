const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const LBL = `(e) => { let l=e.getAttribute('aria-label')||'';
  if(!l){ let p=e.parentElement; for(let i=0;i<5&&p;i++){ if(p.querySelectorAll('input').length===1){ const t=(p.innerText||'').trim(); if(t&&t.length<90){ l=t.split('\\n')[0]; break; } } p=p.parentElement; } } return l.slice(0,52); }`;
const BOXES = `() => { const vis=(${VIS}); const lbl=(${LBL});
  return [...document.querySelectorAll('main input')].filter(vis)
    .filter(e => e.type==='checkbox' || String(e.value)==='on')
    .map(e => lbl(e)+'='+(e.checked===true)); }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  // fill the name and tick ONLY the wildcard
  const name = page.locator('main input').first();
  await name.scrollIntoViewIfNeeded(); await name.fill('D2 wildcard probe'); await page.waitForTimeout(300);
  const idx = (await page.evaluate(`(${BOXES})()`)).findIndex(x => x.startsWith('All company permissions'));
  const h = await page.evaluateHandle(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('main input')].filter(vis).filter(e=>e.type==='checkbox'||String(e.value)==='on')[${idx}]; })()`);
  const wc = h.asElement(); await wc.scrollIntoViewIfNeeded(); await wc.click(); await page.waitForTimeout(600);
  const formBefore = await page.evaluate(`(${BOXES})()`);
  const net=[]; const on = async r => { if(!r.url().includes('/api/v1/')||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,260);}catch{}
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,44)} -> ${r.status()} ${b}`); };
  page.on('response', on);
  const create = page.locator('main button:has-text("Create role")').first();
  await create.scrollIntoViewIfNeeded(); await create.click(); await page.waitForTimeout(3500);
  page.off('response', on);
  // read back what the server stored
  const stored = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const r = await fetch(`/api/v1/companies/${CO}/roles`, { credentials:'include' });
    const j = await r.json(); const arr = Array.isArray(j)?j:(j.roles||[]);
    const t = arr.find(x=>x.name==='D2 wildcard probe');
    return t ? { id:t.id, permissions:t.permissions||'(not in list payload)' } : '(role not found)';
  });
  return { formStateAtCreate: formBefore, requests: net, storedRole: stored };
};
