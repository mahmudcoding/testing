const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
  const TAG = process.env.D2_TAG || '?';
  // what the API hands an observer about that user
  const api = await (async () => {
    await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    return await page.evaluate(async () => {
      const W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
      const get=async u=>{ const r=await fetch(u,{credentials:'include'});
        const t=await r.text(); return { u:u.slice(0,52), s:r.status, body:t.slice(0,300) }; };
      return [ await get(`/api/v1/users/${ALICE}`),
               await get(`/api/v1/users/${ALICE}/status`),
               await get(`/api/v1/workspaces/${W}/presence`) ];
    });
  })();
  // open her profile card through the UI
  const card = await page.evaluate(`(async () => { const vis=(${VIS});
    const nodes=[...document.querySelectorAll('*')].filter(e=>!e.children.length&&/QA Alice/.test(e.innerText||'')).filter(vis);
    if(!nodes.length) return {err:'QA Alice not listed'};
    const btn=nodes[0].closest('button,a,[role=button],li,tr')||nodes[0];
    btn.click(); return {clicked:true}; })()`);
  await page.waitForTimeout(2600);
  const panel = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog],aside,[class*=anel],[class*=rawer]')].filter(vis)
      .filter(e=>/QA Alice/.test(e.innerText||''));
    const pick=dlg.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    const t=pick?(pick.innerText||''):(document.body.innerText||'');
    return { found:!!pick, text:t.replace(/\\s+/g,' ').trim().slice(0,420) }; })()`);
  return { tag:TAG, api, card, panel };
};
