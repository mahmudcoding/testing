import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  return await page.evaluate(async (ws) => {
    const g = async u => { const x = await fetch(u,{credentials:'include'}); let b=null; try{b=await x.json()}catch{} return {u,s:x.status,b}; };
    const out=[];
    out.push(await g('/api/v1/users/me/channels/archived'));
    out.push(await g(`/api/v1/users/me/channels/archived?workspace_id=${ws}`));
    out.push(await g(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=50`));
    return out.map(o=>({u:o.u.replace(ws,'<WS>'), s:o.s, b: JSON.stringify(o.b).slice(0,300)}));
  }, WS);
};
