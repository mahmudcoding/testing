import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const acc=await g('/api/v1/users/me/files?workspace_id=${WS}&scope=accessible&limit=100');
     const own=await g('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100');
     const pick=(arr,name)=>(arr||[]).find(f=>f.filename===name);
     const shared=(acc.j&&acc.j.files||[]).filter(f=>f.user_id!=='U4QEALICE000001');
     const s=shared[0];
     return {
       asRecipient: s?{filename:s.filename, uploader:String(s.user_id).slice(-6),
                       shared_with:s.shared_with, shared_with_len:Array.isArray(s.shared_with)?s.shared_with.length:typeof s.shared_with,
                       context_id:s.context_id===undefined?'absent':String(s.context_id).slice(-6),
                       keys:Object.keys(s)}:null,
       nAccessibleFromOthers: shared.length,
       ownCount:(own.j&&own.j.files||[]).length}; })()`);
};
