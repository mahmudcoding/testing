const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const reqs=[];
  page.on('request', r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(/audit|export/i.test(u)) reqs.push(`${r.method()} ${u.slice(0,90)}`); });
  const dl=[];
  page.on('download', d => { dl.push(d.suggestedFilename()); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = reqs.length;
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Export CSV$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(4500);
  const notices = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3); })()`);
  // read the same data in memory rather than saving a file
  const inMemory = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/admin/audit-log?limit=100`,{credentials:'include'});
    const j=await r.json(); const a=Array.isArray(j)?j:(j.entries||[]);
    return { status:r.status, count:a.length,
             firstKeys:a.length?Object.keys(a[0]):[],
             hasNextCursor: !!(j.next_before||j.next_before_id) };
  });
  return { clicked, requestsAfterClick:reqs.slice(before), downloadsStarted:dl, notices, inMemory };
};
