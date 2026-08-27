import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const out={};
    // resolve qa-empty by its fixture id pattern, then confirm from the response
    for(const id of ['C4QEEMPTY000001','C4QEMPTY0000001']){
      const c=await g('/api/v1/channels/'+id);
      if(c.st===200){ const cj=c.j.channel||c.j;
        out.emptyChannel={id, name:cj.name, type:cj.type}; break; }
      out['try:'+id]=c.st;
    }
    const q='unread';
    const base='/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25';
    out.plain=await g(base).then(r=>({st:r.st,total:r.j&&r.j.total_messages}));
    if(out.emptyChannel){
      const r=await g(base+'&channel_ids='+out.emptyChannel.id);
      out.byHandNonMember={st:r.st, total:r.j&&r.j.total_messages, key:(r.j&&r.j.key)||null};
    }
    // archived channel the user IS in
    const arch=await g('/api/v1/users/me/channels/archived?workspace_id=${WS}');
    const aa=((arch.j&&(arch.j.channels||arch.j.data))||[]).filter(c=>/qa-archived/.test(c.name))[0];
    if(aa){ const r=await g(base+'&channel_ids='+aa.id);
      out.byHandArchived={name:aa.name, st:r.st, total:r.j&&r.j.total_messages, key:(r.j&&r.j.key)||null}; }
    return out; })()`);
};
