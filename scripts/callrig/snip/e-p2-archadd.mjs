import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const P=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      let j=null;try{j=await r.json();}catch(e){} return {st:r.status,j:JSON.stringify(j||{}).slice(0,120)};};
    return {add: await P('/api/v1/channels/members/add',{channel_id:'C4OX3463S8ECN8X', user_id:'U4QEBOB00000001'})}; })()`);
};
