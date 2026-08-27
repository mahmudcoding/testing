// Page the company audit log using the API's OWN next_before / next_before_id,
// with a small limit, and compare the union against the full list.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async ({CO})=>{
    const g=async q=>{const r=await fetch(`/api/v1/companies/${CO}/admin/audit-log?${q}`,{credentials:'include'});
      return await r.json();};
    const full=(await g('limit=100')).entries||[];
    const LIMIT=Number(5);
    const seen=[]; let before=null, beforeId=null, pages=0;
    while (pages<30) {
      let q=`limit=${LIMIT}`;
      if (before) q+=`&before=${encodeURIComponent(before)}&before_id=${encodeURIComponent(beforeId)}`;
      const j=await g(q);
      const rows=j.entries||[];
      seen.push(...rows.map(e=>e.id));
      pages++;
      if (!j.next_before || !rows.length) break;
      before=j.next_before; beforeId=j.next_before_id;
    }
    const set=new Set(seen);
    const missing=full.filter(e=>!set.has(e.id));
    const dupPaged=seen.length-new Set(seen).size;
    return {fullCount:full.length, pages, pagedCount:seen.length, uniquePaged:new Set(seen).size,
      duplicatesWhilePaging:dupPaged,
      missingCount:missing.length,
      missing:missing.slice(0,6).map(e=>({id:e.id, action:e.action, created_at:e.created_at}))};
  }, {CO});
};
