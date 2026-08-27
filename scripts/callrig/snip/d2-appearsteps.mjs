const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const READ = `(() => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  const radios=[...main.querySelectorAll('[role=radio]')].filter(vis)
    .map(r=>({ t:(r.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22), on:r.getAttribute('aria-checked') }));
  const switches=[...main.querySelectorAll('[role=switch]')].filter(vis).map(s=>{
    let n=s,l=''; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
      const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t&&t.length<110){l=t;break;} }
    return { label:l.slice(0,34), on:s.getAttribute('aria-checked') }; });
  const stored=(()=>{ try { return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}'); } catch { return {}; } })();
  return { radios, switches, storedMsgLayout: stored.msgLayout, storedDensity: stored.density }; })()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const read = READ.replace('VISFN', VIS);
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };
  const click=async label=>page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>(x.innerText||'').trim()===${JSON.stringify('')}+arguments[0]);
    return r.length; })()`);
  const out={};
  await go();
  out.step1_initial = await page.evaluate(read);
  // step 2 — Message layout -> Compact, by clicking the radio
  out.step2_click = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis).filter(x=>(x.innerText||'').trim()==='Compact');
    if(r.length!==1) return {n:r.length}; r[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(1800);
  out.step2_after = await page.evaluate(read);
  // step 3 — reload and look again
  await go();
  out.step3_afterReload = await page.evaluate(read);
  // step 4 — the control: change Density, reload
  out.step4_click = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis)
      .filter(x=>/^(Compact|Comfortable|Cozy|Spacious)$/.test((x.innerText||'').trim()))
      .filter(x=>x.getAttribute('aria-checked')!=='true');
    if(!r.length) return {n:0}; r[0].click(); return {n:1, clicked:(r[0].innerText||'').trim()}; })()`);
  await page.waitForTimeout(1800);
  await go();
  out.step4_afterReload = await page.evaluate(read);
  return out;
};
