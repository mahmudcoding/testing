import {WS, BASE} from './e-p2-helpers.mjs';
const CH='C4OX3463S8ECN8X';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const urls = [
    '/api/v1/users/me/channels/archived?workspace_id='+WS,
    '/api/v1/workspaces/'+WS+'/channels',
    '/api/v1/channels/'+CH
  ];
  return await page.evaluate(`(async () => {
     const urls=${JSON.stringify(urls)}; const CH=${JSON.stringify(CH)};
     const out={};
     for(const u of urls){
       const r=await fetch(u,{credentials:'include'}); let j=null; try{j=await r.json();}catch(e){}
       const arr=(j&&(j.channels||j.data||j.items))||(Array.isArray(j)?j:[]);
       out[u.split('/api/v1/')[1].slice(0,40)]={st:r.status, n:arr.length,
         names:arr.map(c=>c.name).slice(0,6), hasProbe:arr.some(c=>c.id===CH),
         single:(j&&j.id===CH)?{name:j.name, archived:j.is_archived}:null,
         err:(j&&j.key)||null};
     }
     return out; })()`);
};
