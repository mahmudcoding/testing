import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  return await page.evaluate(`(async () => {
    const g=async(u,o)=>{const r=await fetch(u,Object.assign({credentials:'include'},o||{}));
      let j=null;try{j=await r.json();}catch(e){} return {st:r.status, j};};
    const out={};
    const b1=await g('/api/v1/messaging/users/blocked');
    out.before={st:b1.st, total:b1.j&&b1.j.total, users:((b1.j&&b1.j.users)||[]).map(u=>u.name)};
    const un=await g('/api/v1/messaging/users/unblock',{method:'POST',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'U4QEBOB00000001'})});
    out.unblock={st:un.st, body:JSON.stringify(un.j||{}).slice(0,120)};
    await new Promise(z=>setTimeout(z,1500));
    const b2=await g('/api/v1/messaging/users/blocked');
    out.after={st:b2.st, total:b2.j&&b2.j.total, users:((b2.j&&b2.j.users)||[]).map(u=>u.name)};
    return out; })()`);
};
