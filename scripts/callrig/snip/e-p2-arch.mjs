import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const arch=await g('/api/v1/users/me/channels/archived?workspace_id=${WS}');
    const aa=((arch.j&&(arch.j.channels||arch.j.data))||[]).filter(c=>/qa-archived/.test(c.name))[0];
    if(!aa) return {err:'no archived fixture channel'};
    const out={channel:{id:aa.id, name:aa.name}};
    // what messages does that channel actually hold?
    const msgs=await g('/api/v1/messaging/channels/'+aa.id+'/messages?limit=20');
    const arr=(msgs.j&&(msgs.j.messages||msgs.j.data))||[];
    out.messages={st:msgs.st, n:arr.length,
      sample:arr.slice(0,3).map(m=>String(m.body||m.text||'').slice(0,34))};
    // search inside it, with and without include_archived
    const base='/api/v1/search?company_id=${CO}&workspace_id=${WS}&limit=25';
    const word = arr.length ? String(arr[0].body||'').split(/\\s+/).filter(w=>w.length>3)[0] : 'unread';
    out.word=word;
    for(const [label,extra] of [['plain',''],
                                ['scoped','&channel_ids='+aa.id],
                                ['scoped+archived','&channel_ids='+aa.id+'&include_archived=true'],
                                ['archivedOnly','&include_archived=true']]){
      const r=await g(base+'&q='+encodeURIComponent(word)+extra);
      out[label]={st:r.st, total:r.j&&r.j.total_messages};
    }
    return out; })()`);
};
