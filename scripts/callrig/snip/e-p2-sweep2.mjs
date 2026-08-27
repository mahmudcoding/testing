import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const ids=['F4OWR5PZZ4XAAJT','F4OWBD79HC09BRJ'];
    const out={};
    for(const id of ids){
      const meta=await g(`/api/v1/files/${id}`);
      out[id]={metaStatus:meta.s,
        name: meta.b?.name||meta.b?.file?.name||null,
        deleted: meta.b?.deleted_at||meta.b?.is_deleted||meta.b?.file?.deleted_at||null,
        keys: meta.b? Object.keys(meta.b).slice(0,12):[],
        err: meta.s>=400? JSON.stringify(meta.b).slice(0,160):null};
    }
    // is either still listed in the workspace file list?
    const all=await g(`/api/v1/users/me/files?workspace_id=${ws}`);
    const arr=all.b?.files||all.b?.data||[];
    out._listedIds=(Array.isArray(arr)?arr:[]).map(f=>f.id).filter(i=>ids.includes(i));
    return out;
  }, WS);
};
