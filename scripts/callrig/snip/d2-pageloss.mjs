export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/audit-log`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});const j=await r.json().catch(()=>null);
      return Array.isArray(j)?j:((j&&j.entries)||[]);};
    const base=`/api/v1/workspaces/${W}/admin/audit-log`;
    // 1. replay EXACTLY what the UI requests, using its own cursor rule
    const pages=[]; let before=null;
    for (let i=0;i<8;i++){
      const u=base+`?limit=100`+(before?`&before=${encodeURIComponent(before)}`:'');
      const r=await get(u);
      if(!r.length) break;
      pages.push({ n:r.length, first:r[0].created_at, last:r[r.length-1].created_at,
                   ids:r.map(e=>e.id) });
      if(r.length<100 && i>0) break;
      before=r[r.length-1].created_at;
      if(pages.length>1 && pages[pages.length-1].last===pages[pages.length-2].last) break;
    }
    const union=new Set(); pages.forEach(p=>p.ids.forEach(id=>union.add(id)));
    // 2. for each page boundary, list every entry sharing that exact timestamp
    const boundaries=pages.slice(0,-1).map(p=>p.last);
    const checks=[];
    for (const T of boundaries) {
      const plus=new Date(new Date(T).getTime()+2000).toISOString().replace(/\.\d+Z$/,'Z');
      const around=await get(base+`?limit=100&before=${encodeURIComponent(plus)}`);
      const sameTs=around.filter(e=>e.created_at===T);
      checks.push({ boundary:T, entriesAtThisTimestamp:sameTs.length,
        missingFromUiWalk: sameTs.filter(e=>!union.has(e.id))
          .map(e=>({id:e.id, action:e.action, at:e.created_at})) });
    }
    return { uiPages:pages.map(p=>({rows:p.n, from:p.first, to:p.last})),
             distinctIdsSeenByUi: union.size,
             boundaryChecks: checks };
  });
};
