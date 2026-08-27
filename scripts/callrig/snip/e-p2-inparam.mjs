import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    // find the ids of channels alice is NOT in
    const dir=await g('/api/v1/workspaces/${WS}/channels');
    const mine=((dir.j&&(dir.j.channels||dir.j.data))||[]).map(c=>({id:c.id,name:c.name}));
    // the directory lists all public channels
    const all=await g('/api/v1/workspaces/${WS}/directory/channels');
    let others=[];
    if(all.st===200){ const arr=(all.j&&(all.j.channels||all.j.data||all.j.items))||[];
      others=arr.map(c=>({id:c.id,name:c.name})); }
    const q='unread';
    const base='/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25';
    const out={myChannels:mine, directoryChannels:others.slice(0,6)};
    out.plain = await g(base).then(r=>({st:r.st,total:r.j&&r.j.total_messages}));
    for(const c of mine){
      const r=await g(base+'&channel_ids='+c.id);
      out['mine:'+c.name]={st:r.st,total:r.j&&r.j.total_messages};
    }
    // a channel the user is not in, by id guess from the directory list
    for(const c of others.filter(o=>!mine.some(m=>m.id===o.id)).slice(0,2)){
      const r=await g(base+'&channel_ids='+c.id);
      out['notMine:'+c.name]={st:r.st,total:r.j&&r.j.total_messages,
        err:r.j&&r.j.key||null};
    }
    return out; })()`);
};
