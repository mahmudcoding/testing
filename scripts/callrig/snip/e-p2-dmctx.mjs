import {WS, BASE} from './e-p2-helpers.mjs';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const out={};
    const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
    const d=await r.json(); const a=d.files||[];
    out.files=a.map(f=>({name:(f.filename||'').slice(0,22), ctx:(f.context_id||'(empty)').slice(-8),
      shared:(f.shared_with||[]).map(s=>s.type+':'+(s.target_name||'')).join(',')||'(none)'}));
    // which files are actually in the DM, per its messages
    const m=await (await fetch('/api/v1/messaging/channels/${DM}/messages?limit=50',{credentials:'include'})).json();
    const msgs=m.messages||m.data||[];
    out.dmAttachments=msgs.flatMap(x=>(x.files||[]).map(f=>f.filename||f.name||f.id)).slice(0,6);
    out.dmMsgKeys=Object.keys(msgs[0]||{}).join(',').slice(0,140);
    return out; })()`);
};
