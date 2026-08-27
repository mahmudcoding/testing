import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const body='mention probe @QA Bob please look';
    const attempts=[
      {label:'mention_user_ids', payload:{channel_id:'C4QEGENERAL0001', body, mention_user_ids:['U4QEBOB00000001']}},
    ];
    const out=[];
    for (const a of attempts){
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body: JSON.stringify(a.payload)});
      const t=await r.text();
      out.push(a.label+' -> '+r.status+' '+t.slice(0,150));
    }
    return out; })()`);
};
