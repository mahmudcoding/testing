const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`,{waitUntil:'networkidle'}); await page.waitForTimeout(2800); };
  await go();
  // #11 — the subtitle/hint text about accepting in the app
  const text = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return (i>=0?t.slice(i+1):t).trim(); })()`);
  // #10 — create a direct invite with no role, then read how it is listed
  const created = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', DAVE='U4QDDAVE0000001';
    const r=await fetch(`/api/v1/workspaces/${W}/invites/direct`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({user_ids:[DAVE], role_ids:[]})});
    const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}
    return { s:r.status, b:t.slice(0,220), j };
  });
  await go();
  const listed = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rows=[...main.querySelectorAll('tr')].filter(vis)
      .map(tr=>[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\\s+/g,' ').trim())).filter(c=>c.length);
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { rows:rows.slice(0,6), hasRoleUnavailable:/Role unavailable/i.test(t) }; })()`);
  return { f11_pageText:text.slice(0,420), f11_mentionsAccept:/accept/i.test(text),
           f10_created:{s:created.s,b:created.b}, f10_listed:listed };
};
