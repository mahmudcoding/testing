export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(async()=>{
    const probe=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json()}catch(e){}
      const a=Array.isArray(j)?j:(j?.entries||j?.items||[]);
      return {status:r.status, count:Array.isArray(a)?a.length:null,
        key:j&&j.key?j.key:undefined, msg:j&&j.message?String(j.message).slice(0,90):undefined,
        scopes:[...new Set((Array.isArray(a)?a:[]).map(e=>e.scope_type||e.scopeType))]};};
    const ws='W4QDF1XTURESO01', co='O4QDF1XTURESO01';
    return {
      wsPlain:   await probe(`/api/v1/workspaces/${ws}/admin/audit-log?limit=100`),
      wsScopeCo: await probe(`/api/v1/workspaces/${ws}/admin/audit-log?limit=100&scope_type=company`),
      coPlain:   await probe(`/api/v1/companies/${co}/admin/audit-log?limit=100`),
      coScopeCo: await probe(`/api/v1/companies/${co}/admin/audit-log?limit=100&scope_type=company`)
    };
  });
}
