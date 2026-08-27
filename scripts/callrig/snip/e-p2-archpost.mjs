import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({channel_id:'C4OX3463S8ECN8X', body:'archive notification probe'})});
    let j=null;try{j=await r.json();}catch(e){}
    return {st:r.status, id:String((j&&(j.id||(j.message&&j.message.id)))||'').slice(-6)}; })()`);
};
