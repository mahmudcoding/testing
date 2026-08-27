export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const get=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      let j=null;try{j=JSON.parse(t)}catch{};return{s:r.status,j,raw:t.slice(0,200)};};
    const out={};
    const cr=await get(`/api/v1/companies/${CO}/roles`);
    const wr=await get(`/api/v1/workspaces/${W}/roles`);
    const list=r=>Array.isArray(r.j)?r.j:((r.j&&(r.j.roles||r.j.items))||[]);
    out.companyRoleIds=list(cr).map(x=>({name:x.name,id:x.id}));
    out.workspaceRoleIds=list(wr).map(x=>({name:x.name,id:x.id}));
    const mem=await get(`/api/v1/companies/${CO}/members`);
    const ms=Array.isArray(mem.j)?mem.j:((mem.j&&(mem.j.members||mem.j.items))||[]);
    const a=ms.find(m=>(m.user_id||m.id)===ALICE||/alice/i.test(JSON.stringify(m)));
    out.aliceMemberRow = a ? JSON.stringify(a).slice(0,420) : null;
    out.membersEndpointStatus = mem.s;
    return out;
  });
};
