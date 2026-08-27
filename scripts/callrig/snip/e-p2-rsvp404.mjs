import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const me=await g('/api/v1/auth/me'); const myId=me.b?.id||me.b?.user?.id;
    const from=new Date(Date.now()-86400000).toISOString(), to=new Date(Date.now()+3*86400000).toISOString();
    const list=await g(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`);
    const arr=list.b?.meetings||list.b?.data||[];
    const mine=(Array.isArray(arr)?arr:[]).filter(m=>(m.created_by||m.creator_id)!==myId);
    const out=[];
    for(const m of mine.slice(0,4)){
      // POST respond and read the error, without changing anything that succeeds
      const r=await fetch(`/api/v1/calendar/meetings/${m.id}/respond`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({status:'accepted'})});
      let eb=null; try{eb=await r.json()}catch{}
      out.push({title:(m.title||'').slice(0,26), my_status:m.my_status,
        respondStatus:r.status, key:eb?.key||null, message:(eb?.message||'').slice(0,60)});
    }
    // and one where I AM the organiser, as a control
    const own=(Array.isArray(arr)?arr:[]).find(m=>(m.created_by||m.creator_id)===myId);
    let ownRes=null;
    if(own){
      const r=await fetch(`/api/v1/calendar/meetings/${own.id}/respond`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({status:'accepted'})});
      let eb=null; try{eb=await r.json()}catch{}
      ownRes={title:(own.title||'').slice(0,26), my_status:own.my_status, respondStatus:r.status,
        key:eb?.key||null, message:(eb?.message||'').slice(0,60)};
    }
    return {asInvitee:out, asOrganiser:ownRes};
  }, WS);
};
