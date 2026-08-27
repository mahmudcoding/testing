import {WS, BASE} from './e-p2-helpers.mjs';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const out={};
    for(const scope of ['own','accessible']){
      const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope='+scope+'&limit=100',{credentials:'include'});
      const d=await r.json(); const a=d.files||[];
      out['files_'+scope]={n:a.length, contexts:[...new Set(a.map(f=>(f.context_id||'').slice(-6)))].slice(0,6),
        dmFiles:a.filter(f=>f.context_id==='${DM}').map(f=>f.filename).slice(0,5)};
    }
    // and what the DM itself shows as attachments
    const m=await (await fetch('/api/v1/messaging/channels/${DM}/messages?limit=50',{credentials:'include'})).json();
    const msgs=m.messages||m.data||[];
    out.dmMessagesWithFiles = msgs.filter(x=>(x.files&&x.files.length)||x.has_files).length;
    out.dmMsgCount = msgs.length;
    return out; })()`);
};
