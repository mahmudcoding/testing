export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const shown = await page.evaluate(()=>{const m=document.querySelector('main');const t=(m.innerText||'').replace(/\s+/g,' ');const i=t.indexOf('Overview');return t.slice(i,i+320);});
  const truth = await page.evaluate(async(a)=>{
    const wsMembers = await (await fetch(`/api/v1/workspaces/${a.WS}/members`,{credentials:'include'})).json();
    const mine = await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json();
    const arr = Array.isArray(wsMembers)?wsMembers:(wsMembers.members||wsMembers.data||[]);
    return {workspaceMembers:arr.length, myWorkspacesInThisCompany:(mine.workspaces||[]).filter(w=>w.company_id===a.CO).length};
  },{WS,CO});
  return {shown, truth};
};
