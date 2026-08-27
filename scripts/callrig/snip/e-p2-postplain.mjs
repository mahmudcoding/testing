import {WS, BASE} from './e-p2-helpers.mjs';
const BODY = process.env.QA_BODY || 'notification control probe plain';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id:'C4QEGENERAL0001', body:${JSON.stringify(BODY)}})});
    const t=await r.text(); return r.status+' '+t.slice(0,110); })()`);
};
