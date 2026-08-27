import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const out={};
     // what is C4OWQV2ZT4AAI6R?
     const c=await g('/api/v1/channels/C4OWQV2ZT4AAI6R');
     const cj=(c.j&&(c.j.channel||c.j))||{};
     out.thatChannel={st:c.st, name:cj.name, type:cj.type, isDm:cj.is_dm,
                      keys:Object.keys(cj).slice(0,12)};
     // list DMs
     for(const u of ['/api/v1/users/me/dms?workspace_id=${WS}',
                     '/api/v1/messaging/dms?workspace_id=${WS}',
                     '/api/v1/workspaces/${WS}/dms']){
       const r=await g(u);
       if(r.st===200){ const arr=(r.j&&(r.j.dms||r.j.data||r.j.items||r.j.channels))||[];
         out.dmEndpoint={u:u.split('/api/v1/')[1], st:r.st, n:arr.length,
           rows:arr.slice(0,4).map(d=>({id:String(d.id).slice(-6), name:d.name,
             other:(d.participants||d.members||[]).map(p=>p.name||p.user_id).slice(0,2)}))};
         break; } }
     return out; })()`);
};
