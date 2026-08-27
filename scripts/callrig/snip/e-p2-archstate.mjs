import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}
       return {st:r.status, j};};
     const out={};
     for(const u of ['/api/v1/users/me/channels/archived?workspace_id=',
                     '/api/v1/users/me/channels/archived',
                     '/api/v1/workspaces//channels']){
       const r=await g(u);
       const arr=(r.j&&(r.j.channels||r.j.data||r.j.items))||(Array.isArray(r.j)?r.j:[]);
       out[u.split('/api/v1/')[1].slice(0,44)]={st:r.st, n:arr.length,
         names:arr.map(c=>c.name).slice(0,6), hasProbe:arr.some(c=>c.id==='C4OX3463S8ECN8X'),
         topKeys:r.j?Object.keys(r.j).slice(0,4):[]};
     }
     return out; })()`);
};
