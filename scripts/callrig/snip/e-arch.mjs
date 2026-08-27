export default async ({page}) => {
  return await page.evaluate(async()=>{
    const a=await (await fetch('/api/v1/users/me/channels/archived',{credentials:'include'})).json().catch(()=>null);
    const c=await (await fetch('/api/v1/workspaces/W4QEF1XTURESO01/channels',{credentials:'include'})).json().catch(()=>null);
    return {archived:JSON.stringify(a).slice(0,200),
      channels:(c&&(c.channels||[])).map(x=>x.name+(x.is_archived?'[ARCHIVED]':'')).slice(0,8)};
  });
};
