import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const out={};
    // ALK-2020: does the file list include DM-context files for this participant?
    for(const scope of ['own','accessible']){
      const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope='+scope+'&limit=100',{credentials:'include'});
      const d=await r.json(); const a=d.files||[];
      out['files_'+scope]={n:a.length,
        dmContext:a.filter(f=>f.context_id==='${DM}').map(f=>f.filename).slice(0,5)};
    }
    // ALK-1591: does search reach Saved Messages?
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    out.savedProbe = await (async () => {
      const r=await fetch('/api/v1/search?q=saved&company_id=${CO}&workspace_id=${WS}&limit=10',{credentials:'include'});
      const d=await r.json(); return {tm:d.total_messages}; })();
    return out; })()`);
};
