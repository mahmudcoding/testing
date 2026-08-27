import {WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  return await page.evaluate(async ({GEN}) => {
    const tok='missedwhileoffline'+String(Date.now()).slice(-4);
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:GEN, body:`sent during bob's outage ${tok}`})});
    return {token:tok, status:r.status};
  }, {GEN});
};
