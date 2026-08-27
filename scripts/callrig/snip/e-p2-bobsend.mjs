import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const tag = process.env.QA_TAG || 'x';
  return await page.evaluate(`(async () => {
    const out=[];
    for(let i=1;i<=3;i++){
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({channel_id:'C4QEGENERAL0001', body:'badge-probe-${'$'}{i} ${tag}'.replace('\${i}',i)})});
      let j=null; try{j=await r.json();}catch(e){}
      out.push({i, st:r.status, id:(j&&(j.id||(j.message&&j.message.id))||'').toString().slice(-6)});
      await new Promise(z=>setTimeout(z,1500));
    }
    return out; })()`);
};
