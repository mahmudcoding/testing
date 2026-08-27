const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const CB = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=combobox]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`,{waitUntil:'networkidle'}); await page.waitForTimeout(2800); };
  const store=()=>page.evaluate(`(() => { try{return JSON.parse(localStorage.getItem('aloqa-call-device-prefs')).state;}catch{return null;} })()`);
  await load();
  const before = { combo: await page.evaluate(`(() => (${CB}()[0].innerText||'').trim())()`), store: await store() };
  await page.evaluate(`(() => { const c=${CB}(); c[0].click(); })()`);
  await page.waitForTimeout(1100);
  const picked = await page.evaluate(`(() => { const vis=(${VIS});
    const o=[...document.querySelectorAll('[role=option]')].filter(vis);
    const alt=o.filter(x=>x.getAttribute('aria-selected')!=='true')[0];
    if(!alt) return {none:true, all:o.map(x=>(x.innerText||'').trim())};
    const t=(alt.innerText||'').trim(); alt.click(); return {picked:t}; })()`);
  await page.waitForTimeout(1500);
  const afterPick = { combo: await page.evaluate(`(() => (${CB}()[0].innerText||'').trim())()`), store: await store() };
  const bar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  await load();
  const afterReload = { combo: await page.evaluate(`(() => (${CB}()[0].innerText||'').trim())()`), store: await store() };
  // restore: pick the original back
  await page.evaluate(`(() => { const c=${CB}(); c[0].click(); })()`);
  await page.waitForTimeout(1100);
  const restored = await page.evaluate(`(() => { const vis=(${VIS}); const want=${JSON.stringify('X')};
    const o=[...document.querySelectorAll('[role=option]')].filter(vis);
    const hit=o.filter(x=>(x.innerText||'').trim()===WANT); if(hit.length){hit[0].click(); return true;} return false; })()`
    .replace('WANT', JSON.stringify(before.combo)));
  await page.waitForTimeout(1400);
  await load();
  const final = { combo: await page.evaluate(`(() => (${CB}()[0].innerText||'').trim())()`), store: await store() };
  return { before, picked, afterPick, saveBar:bar, afterReload, restoredClicked:restored, final,
           persisted: afterReload.combo===afterPick.combo };
};
