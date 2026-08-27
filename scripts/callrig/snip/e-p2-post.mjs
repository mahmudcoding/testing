import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id:'C4QEGENERAL0001', body:'cross-workspace unread probe'})});
    const t=await r.text(); return r.status+' '+t.slice(0,80); })()`);
};
