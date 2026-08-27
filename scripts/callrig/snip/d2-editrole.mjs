const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const TARGET = process.env.D2_ROLE || 'D2 union W';
  const reqs=[];
  page.on('response', async r => { const m=r.request().method(); if(m==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\//.test(u)) return;
    let b=''; try{ b=(await r.text()).slice(0,180);}catch{}
    reqs.push(`${m} ${u.slice(0,58)} -> ${r.status()} ${b}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  // locate the Edit button on the row whose text contains TARGET
  const rowY = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(TARGET)};
    const leaf=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&(e.innerText||'').trim()===T).filter(vis)[0];
    return leaf ? Math.round(leaf.getBoundingClientRect().top) : null; })()`);
  if (rowY===null) return { err:'target role name not visible' };
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const cands=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>(b.innerText||'').trim()==='Edit')
      .filter(b=>Math.abs(b.getBoundingClientRect().top-${rowY})<40);
    if(cands.length!==1) return {n:cands.length};
    cands[0].click(); return {n:1}; })()`);
  if (clicked.n!==1) return { err:'ambiguous Edit', rowY, ...clicked };
  await page.waitForTimeout(1500);
  // CONFIRM which role the form holds before touching anything
  const form = await page.evaluate(`(() => { const vis=(${VIS});
    const ins=[...document.querySelectorAll('input[type=text],input:not([type])')].filter(vis).map(i=>i.value);
    const boxes=[...document.querySelectorAll('input[type=checkbox]')].filter(vis).map(cb=>{
      const lab=cb.closest('label')||cb.parentElement;
      return { checked:cb.checked, label:((lab&&lab.innerText)||'').replace(/\\s+/g,' ').trim().slice(0,60) };});
    const btns=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean);
    return { textInputs:ins, boxes, btns:[...new Set(btns)].slice(0,12) }; })()`);
  return { rowY, form, requests:reqs };
};
