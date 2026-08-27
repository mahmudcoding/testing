import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const p=await g(`/api/v1/workspaces/${ws}/presence`);
    const me=await g('/api/v1/auth/me');
    const raw=JSON.stringify(p.b);
    return {status:p.s, rawLen:raw.length, raw: raw.slice(0,700),
      myId: (me.b?.id||me.b?.user?.id)? 'resolved':'?'};
  }, WS);
};
