import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const myId=me?.id||me?.user?.id;
    const from=new Date(Date.now()-3*86400000).toISOString(), to=new Date(Date.now()+7*86400000).toISOString();
    const r=await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`,{credentials:'include'});
    const b=await r.json(); const arr=b.meetings||b.data||[];
    const rows=(Array.isArray(arr)?arr:[]).map(m=>({id:m.id, title:(m.title||'').slice(0,30),
      creator:m.created_by||m.creator_id||m.organizer_id, my_status:m.my_status,
      iAmOrganiser:(m.created_by||m.creator_id||m.organizer_id)===myId}));
    return {myIdKnown:!!myId, total:rows.length,
      asInvitee: rows.filter(x=>!x.iAmOrganiser).slice(0,6),
      asOrganiser: rows.filter(x=>x.iAmOrganiser).length};
  }, WS);
};
