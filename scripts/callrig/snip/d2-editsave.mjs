const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const TARGET = process.env.D2_ROLE || 'D2 union W';
  const BOX = process.env.D2_BOX || 'View the workspace audit log';
  const WANT = process.env.D2_WANT === '1';   // desired checked state
  const reqs=[];
  page.on('response', async r => { const m=r.request().method(); if(m==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{ b=(await r.text()).slice(0,220);}catch{}
    reqs.push(`${m} ${u.slice(0,60)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  const rowY = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(TARGET)};
    const leaf=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&(e.innerText||'').trim()===T).filter(vis)[0];
    return leaf ? Math.round(leaf.getBoundingClientRect().top) : null; })()`);
  if (rowY===null) return { err:'role name not visible' };
  const c1 = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button')].filter(vis).filter(b=>(b.innerText||'').trim()==='Edit')
      .filter(b=>Math.abs(b.getBoundingClientRect().top-${rowY})<40);
    if(c.length!==1) return {n:c.length}; c[0].click(); return {n:1}; })()`);
  if (c1.n!==1) return { err:'ambiguous Edit', n:c1.n };
  await page.waitForTimeout(1400);
  const toggled = await page.evaluate(`(() => { const vis=(${VIS}); const L=${JSON.stringify(BOX)}; const want=${WANT};
    const boxes=[...document.querySelectorAll('input[type=checkbox]')].filter(vis).map(cb=>{
      const lab=cb.closest('label')||cb.parentElement;
      return {cb, label:((lab&&lab.innerText)||'').replace(/\\s+/g,' ').trim()};});
    const hit=boxes.filter(o=>o.label===L);
    if(hit.length!==1) return {matched:hit.length, labels:boxes.map(o=>o.label.slice(0,45))};
    const before=hit[0].cb.checked;
    if(before!==want) hit[0].cb.click();
    return { matched:1, before, after:hit[0].cb.checked,
             allNow:boxes.filter(o=>o.cb.checked).map(o=>o.label.slice(0,45)) }; })()`);
  if (toggled.matched!==1) return { err:'checkbox not uniquely matched', toggled };
  await page.waitForTimeout(400);
  const saved = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>(x.innerText||'').trim()==='Save');
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2500);
  return { rowY, toggled, saveClicked:saved, requests:reqs };
};
