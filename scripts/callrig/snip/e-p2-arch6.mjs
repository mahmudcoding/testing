import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws) => {
    const g = async u => { const x = await fetch(u,{credentials:'include'}); let b=null; try{b=await x.json()}catch{} return {s:x.status,b}; };
    const out={};
    for (const [k,id] of [['qa-archived','C4QEARCHIVE0001'],['e-arch-probe','C4OX3463S8ECN8X'],['qa-general(control)','C4QEGENERAL0001']]) {
      const m = await g(`/api/v1/messaging/channels/${id}/messages?limit=100`);
      const arr = m.b?.messages||m.b?.data||(Array.isArray(m.b)?m.b:[]);
      out[k]={status:m.s, n:Array.isArray(arr)?arr.length:null,
              sample:(Array.isArray(arr)?arr:[]).slice(-3).map(x=>(x.body||'').slice(0,40))};
    }
    return out;
  }, WS);
};
