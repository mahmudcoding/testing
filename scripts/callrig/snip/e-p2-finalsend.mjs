import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // sends from THIS browser (alice) into the channel bob is parked on. No navigation needed.
  const token='finalcheck'+new Date().toTimeString().slice(0,5).replace(':','');
  const r = await page.evaluate(async (tok)=>{
    const x=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QEGENERAL0001', body:'long-session realtime proof '+tok})});
    return {status:x.status};
  }, token);
  return {token, post:r};
};
