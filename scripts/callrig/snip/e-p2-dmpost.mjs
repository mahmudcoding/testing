import {WS, BASE} from './e-p2-helpers.mjs';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id:'${DM}', body:'dm notification probe'})});
    const t=await r.text(); return r.status+' '+t.slice(0,100); })()`);
};
