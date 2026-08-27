export default async ({ page }) => {
  const CO='O4QDF1XTURESO01';
  return await page.evaluate(async (CO) => {
    const r=await fetch(`/api/v1/companies/${CO}`,{credentials:'include'});
    const t=await r.text(); let keys=[],ownerField=null;
    try{ const p=JSON.parse(t); const o=p.company||p.data||p; keys=Object.keys(o);
      ownerField=o.owner!==undefined?('owner: '+JSON.stringify(o.owner).slice(0,80))
                 :(o.owner_id!==undefined?('owner_id: '+o.owner_id):'(neither owner nor owner_id)');
    }catch{}
    return { status:r.status, keys, ownerField };
  }, CO);
};
