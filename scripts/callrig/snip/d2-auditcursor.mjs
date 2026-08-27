export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async (WS)=>{
    const get=async q=>{const r=await fetch(`/api/v1/workspaces/${WS}/admin/audit-log?${q}`,{credentials:'include'});
      const j=await r.json(); return {status:r.status, rows:Array.isArray(j)?j:(j.entries||j)};};
    const full=(await get('limit=100')).rows;
    const counts={}; full.forEach(e=>counts[e.created_at]=(counts[e.created_at]||0)+1);
    const dup=Object.keys(counts).find(t=>counts[t]>1);
    const pair=full.filter(e=>e.created_at===dup);
    const out={precision_api:full[0].created_at, duplicateGroup:pair.map(e=>({id:e.id,action:e.action}))};
    // cursor = the FIRST of the pair (as page 1 would end)
    const first=pair[0];
    const a=await get(`limit=100&before=${encodeURIComponent(first.created_at)}`);
    const b=await get(`limit=100&before=${encodeURIComponent(first.created_at)}&before_id=${first.id}`);
    const has=(rows,id)=>rows.some(e=>e.id===id);
    out.secondOfPair = pair[1] ? {id:pair[1].id, action:pair[1].action} : null;
    out.withBeforeOnly   = {status:a.status, n:a.rows.length, includesSecondOfPair: pair[1]? has(a.rows,pair[1].id):null};
    out.withBeforeAndId  = {status:b.status, n:b.rows.length, includesSecondOfPair: pair[1]? has(b.rows,pair[1].id):null};
    // does the endpoint accept before_id at all / reject an unknown param?
    const c=await get(`limit=3&before_id=nonsense`);
    out.beforeIdAlone = {status:c.status, n:Array.isArray(c.rows)?c.rows.length:'n/a'};
    return out;
  }, WS);
};
