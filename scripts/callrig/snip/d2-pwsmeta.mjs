export default async ({ page }) => {
  return await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    const p=await r.json(); const a=p.workspaces||p.data||p;
    const list=(Array.isArray(a)?a:[]);
    const cos=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).json();
    return { workspaces:list.map(w=>({name:w.name,type:w.type,id:w.id,company_id:w.company_id,owner_id:w.owner_id})),
             companies: JSON.stringify(cos).slice(0,300) };
  });
};
