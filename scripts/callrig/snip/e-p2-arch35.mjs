import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const f=await g(`/api/v1/users/me/files?workspace_id=${ws}&scope=own`);
    const all=await g(`/api/v1/users/me/files?workspace_id=${ws}`);
    const pick=r=>{const a=r.b?.files||r.b?.data||(Array.isArray(r.b)?r.b:[]);return (Array.isArray(a)?a:[]).map(x=>({
      name:x.name||x.filename, ctx:x.context_id||x.channel_id||null, ctype:x.context_type||null}));};
    // which contexts appear, and is the archived channel among them
    return {ownStatus:f.s, own:pick(f), allStatus:all.s, allCount:pick(all).length,
      contexts:[...new Set(pick(all).map(x=>x.ctx))],
      archivedChannelId:'C4OX3463S8ECN8X',
      anyInArchived: pick(all).filter(x=>x.ctx==='C4OX3463S8ECN8X')};
  }, WS);
};
