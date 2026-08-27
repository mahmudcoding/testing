import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const me=await g('/api/v1/auth/me');
    const myId=me.b?.id||me.b?.user?.id;
    const p=await g(`/api/v1/workspaces/${ws}/presence`);
    const pres=(p.b?.presences||[]).map(e=>({u:e.user_id, online:e.online, mine:e.user_id===myId}));
    const mem=await g(`/api/v1/workspaces/${ws}/members`);
    const arr=mem.b?.members||mem.b?.data||[];
    const rows=(Array.isArray(arr)?arr:[]).map(m=>({
      u:m.user_id, name:m.name||m.display_name,
      presence:JSON.stringify(m.presence||null),
      statusKeys:Object.keys(m).filter(k=>/status|presence|emoji|away/i.test(k)),
      status:JSON.stringify(m.status ?? m.user_status ?? null)}));
    return {myPresence: pres.find(x=>x.mine)||null,
      presenceAll: pres.map(x=>`${x.online?'on':'off'}${x.mine?'(me)':''}`),
      memberRowSample: rows.slice(0,3),
      anyStatusFieldInMembers: rows.some(r=>r.statusKeys.length>0)};
  }, WS);
};
