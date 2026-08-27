import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const now=Date.now(); const age=d=>d?Math.round((now-new Date(d).getTime())/86400000*10)/10:null;
    const c=await g('/api/v1/workspaces/${WS}/channels');
    const arr=(c.j&&(c.j.channels||c.j.data||c.j.items))||[];
    const s=await g('/api/v1/search?q=general&company_id=${CO}&workspace_id=${WS}&limit=25');
    const j=s.j||{};
    return {channels:arr.slice(0,6).map(x=>({n:x.name, created:(x.created_at||'').slice(0,10), days:age(x.created_at)})),
            searchBuckets:{m:(j.messages||[]).length, f:(j.files||[]).length, u:(j.users||[]).length, c:(j.channels||[]).length},
            chanHit:(j.channels||[]).slice(0,3).map(x=>({n:x.name, created:(x.created_at||'').slice(0,10), days:age(x.created_at)}))}; })()`);
};
