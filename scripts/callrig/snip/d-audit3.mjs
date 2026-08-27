export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(async(a)=>{
    const {WS,CO}=a;
    const probe = async u => { try{const r=await fetch(u,{credentials:'include'}); const t=await r.text(); return {u:u.replace('/api/v1',''), s:r.status, len:t.length, b:t.slice(0,300)};}catch(e){return{u,e:String(e).slice(0,80)};} };
    const wsName = await (await fetch(`/api/v1/workspaces/${WS}`,{credentials:'include'})).json();
    return {
      workspaceName: wsName.name,
      company: await probe(`/api/v1/companies/${CO}/admin/audit-log?limit=100`),
      workspace: await probe(`/api/v1/workspaces/${WS}/admin/audit-log?limit=100`),
    };
  }, {WS,CO});
};
