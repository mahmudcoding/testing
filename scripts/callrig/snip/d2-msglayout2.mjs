const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// click a radio by label, but only inside the block that names the given setting
const CLICK = `(setting, option) => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  const radios=[...main.querySelectorAll('[role=radio]')].filter(vis)
    .filter(r=>(r.innerText||'').trim()===option);
  const scoped=radios.filter(r=>{ let n=r;
    for(let i=0;i<8&&n;i++){ n=n.parentElement; if(!n) break;
      const t=(n.innerText||''); if(t.includes(setting)) return true;
      if(t.length>900) break; }
    return false; });
  if(scoped.length!==1) return { matched:radios.length, scoped:scoped.length };
  scoped[0].click(); return { matched:radios.length, scoped:1, clicked:true }; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const click = CLICK.replace('VISFN', VIS);
  const state = `(() => { try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch { return {}; } })()`;
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };
  const out={};
  await go();
  // 1. restore density first
  out.restoreDensity = await page.evaluate(`(${click})('Density','Cozy')`);
  await page.waitForTimeout(1500);
  out.afterRestore = await page.evaluate(state);
  // 2. now the real test: Message layout -> Compact, scoped to its own block
  out.clickMsgLayout = await page.evaluate(`(${click})('Message layout','Compact')`);
  await page.waitForTimeout(1800);
  out.storedRightAfter = await page.evaluate(state);
  await go();
  out.storedAfterReload = await page.evaluate(state);
  out.shownAfterReload = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>/^(Standard|Compact)$/.test((x.innerText||'').trim()))
      .filter(x=>{ let n=x; for(let i=0;i<8&&n;i++){ n=n.parentElement; if(!n)break;
        if((n.innerText||'').includes('Message layout')) return true; } return false; })
      .map(x=>({t:(x.innerText||'').trim(), on:x.getAttribute('aria-checked')}));
    return r; })()`);
  return out;
};
