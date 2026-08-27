export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const r=await fetch(`/api/v1/workspaces/${WS}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({name:'QA Workspace D'})});
    const t=await r.text();
    const v=await fetch(`/api/v1/users/me/workspaces`,{credentials:'include'});
    const vt=await v.text(); let now=null;
    try{ const p=JSON.parse(vt); const arr=p.workspaces||p.data||p; now=(Array.isArray(arr)?arr:[]).find(x=>x.id===WS)?.name; }catch{}
    return { patch:{s:r.status,t:t.slice(0,140)}, nameNow: now };
  }, WS);
};
