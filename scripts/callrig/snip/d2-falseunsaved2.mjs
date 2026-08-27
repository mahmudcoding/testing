const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => { await fetch('/api/v1/users/me/status',{method:'PUT',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'Focus time',emoji:'🎧',expires_at:null})}); });
  const seen=[];
  const nav = page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'commit' }).catch(()=>{});
  for (let i=0;i<24;i++) {
    await page.waitForTimeout(220);
    try { seen.push(await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      return { u:/unsaved/i.test(t),
        b:[...document.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').trim()).filter(x=>/^(Save|Discard)/.test(x)).length }; })()`)); } catch {}
  }
  await nav;
  const cleanup = await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/me/status',{method:'DELETE',credentials:'include'}); return r.status; });
  return { everUnsaved: seen.some(s=>s.u), everSaveBar: seen.some(s=>s.b>0), samples:seen.length,
           pattern: seen.slice(0,8).map(s=>`${s.u?'U':'-'}${s.b}`).join(' '), statusCleanup:cleanup };
};
