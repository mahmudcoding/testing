export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async ({WS,CO})=>{
    const raw=async u=>{const r=await fetch(u,{credentials:'include'}); return {status:r.status, body:await r.text()};};
    const co1=await raw(`/api/v1/companies/${CO}/admin/audit-log?limit=3`);
    const ws1=await raw(`/api/v1/workspaces/${WS}/admin/audit-log?limit=3`);
    const shape=b=>{try{const j=JSON.parse(b); return Array.isArray(j)?('bare array, '+j.length):('object keys: '+Object.keys(j).join(','));}catch{return 'unparsed';}};
    const out={company:{status:co1.status, shape:shape(co1.body)}, workspace:{status:ws1.status, shape:shape(ws1.body)}};
    // does the company endpoint honour before_id inside a duplicate group?
    const all=JSON.parse((await raw(`/api/v1/companies/${CO}/admin/audit-log?limit=100`)).body).entries||[];
    const counts={}; all.forEach(e=>counts[e.created_at]=(counts[e.created_at]||0)+1);
    const dup=Object.keys(counts).find(t=>counts[t]>1);
    out.companyTotal=all.length; out.companyDup=dup||null;
    if (dup) {
      const pair=all.filter(e=>e.created_at===dup);
      const a=JSON.parse((await raw(`/api/v1/companies/${CO}/admin/audit-log?limit=100&before=${encodeURIComponent(dup)}`)).body).entries||[];
      const b=JSON.parse((await raw(`/api/v1/companies/${CO}/admin/audit-log?limit=100&before=${encodeURIComponent(dup)}&before_id=${pair[0].id}`)).body).entries||[];
      out.pair=pair.map(e=>({id:e.id,action:e.action}));
      out.beforeOnly_includesSecond = a.some(e=>e.id===pair[1].id);
      out.beforeAndId_includesSecond = b.some(e=>e.id===pair[1].id);
    }
    return out;
  }, {WS,CO});
};
