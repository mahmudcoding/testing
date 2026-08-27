import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const tag=process.env.QA_TAG||'x';
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({channel_id:'C4QEGENERAL0001', body:'longsession realtime ${tag}'})});
    return {st:r.status}; })()`);
};
