import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const tag = process.env.QA_TAG || 'x';
  return await page.evaluate(`(async () => {
    const P=async(u,b)=>{const r=await fetch(u,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      let j=null;try{j=await r.json();}catch(e){} return {st:r.status,j};};
    const out={};
    const c=await P('/api/v1/channels',{name:'e-arch-probe-${tag}',type:'public',workspace_id:'${WS}'});
    out.create={st:c.st, id:(c.j&&(c.j.id||(c.j.channel&&c.j.channel.id)))||null,
                body:JSON.stringify(c.j||{}).slice(0,140)};
    if(!out.create.id) return out;
    const add=await P('/api/v1/channels/members/add',{channel_id:out.create.id, user_ids:['U4QEBOB00000001']});
    out.addBob={st:add.st, body:JSON.stringify(add.j||{}).slice(0,120)};
    return out; })()`);
};
