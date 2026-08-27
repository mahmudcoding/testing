export default async ({page}) => {
  return await page.evaluate(async()=>{
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r = await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members',{credentials:'include'});
    let t=await r.text();
    let inWs=null; try{const j=JSON.parse(t); const arr=Array.isArray(j)?j:(j.members||j.data||[]); inWs=arr.map(m=>m.username||m.user?.username||m.user_id).filter(Boolean);}catch(e){}
    const wsList = await fetch('/api/v1/users/me/workspaces',{credentials:'include'}).then(x=>x.text()).catch(()=>'err');
    return {me:{email:me.email,id:me.id}, membersStatus:r.status, inWs, myWorkspaces:wsList.slice(0,400)};
  });
};
