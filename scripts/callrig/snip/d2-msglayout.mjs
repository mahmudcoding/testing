const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// the radio whose group is exactly {Standard, Compact}
const GRP = `(() => { const vis=(VISFN); const main=document.querySelector('main')||document.body;
  const rs=[...main.querySelectorAll('[role=radio]')].filter(vis);
  const byGroup=new Map();
  for(const r of rs){ let n=r.parentElement, key=null;
    for(let i=0;i<4&&n;i++){ const kids=[...n.querySelectorAll('[role=radio]')].filter(vis);
      if(kids.length>=2){ key=n; break; } n=n.parentElement; }
    if(!key) continue; if(!byGroup.has(key)) byGroup.set(key,[]); byGroup.get(key).push(r); }
  for(const [,kids] of byGroup){ const labels=kids.map(k=>(k.innerText||'').trim());
    if(labels.length===2 && labels.includes('Standard') && labels.includes('Compact')) return kids; }
  return []; })`;
const DUMP = `(() => { const ls={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); ls[k]=(localStorage.getItem(k)||'').slice(0,300);}
  return { ls, cookies:document.cookie.split(';').map(c=>c.trim().split('=')[0]).filter(Boolean) }; })`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const grp = GRP.replace('VISFN', VIS);
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,46)} <- ${(r.request().postData()||'').slice(0,80)} -> ${r.status()}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };
  const state=()=>page.evaluate(`(() => ${grp}().map(r=>((r.innerText||'').trim())+'='+r.getAttribute('aria-checked')))()`);
  await load();
  const s0 = await state();
  const dump0 = await page.evaluate(`${DUMP}()`);
  // click Compact
  const click = async which => page.evaluate(`(() => { const g=${grp}();
    const t=g.filter(r=>(r.innerText||'').trim()===${JSON.stringify('X')});
    const hit=g.filter(r=>(r.innerText||'').trim()===WHICH); if(hit.length!==1) return {n:hit.length};
    hit[0].click(); return {n:1}; })()`.replace('WHICH', JSON.stringify(which)));
  const c1 = await click('Compact');
  await page.waitForTimeout(1000);
  const s1 = await state();
  const bar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  net.length=0;
  if (bar.some(t=>/^Save/.test(t))) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2500);
  }
  const s2 = await state();
  const dump1 = await page.evaluate(`${DUMP}()`);
  await load();
  const s3 = await state();
  const dump2 = await page.evaluate(`${DUMP}()`);
  // now try to toggle again after the reload
  const c2 = await click('Compact');
  await page.waitForTimeout(1000);
  const s4 = await state();
  const diff=(a,b)=>{const o={}; for(const k of new Set([...Object.keys(a.ls),...Object.keys(b.ls)])) if(a.ls[k]!==b.ls[k]) o[k]=[(a.ls[k]||'(absent)').slice(0,120),(b.ls[k]||'(absent)').slice(0,120)]; return o;};
  return { s0_onLoad:s0, clickCompact:c1, s1_afterClick:s1, saveBar:bar, s2_afterSave:s2,
           s3_afterReload:s3, clickAgain:c2, s4_afterSecondClick:s4,
           lsDiff_saveEffect:diff(dump0,dump1), lsDiff_reloadEffect:diff(dump1,dump2),
           cookies:dump0.cookies, net:net.slice(0,5) };
};
