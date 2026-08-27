import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const now=Date.now(); const age=d=>d?Math.round((now-new Date(d).getTime())/86400000*10)/10:null;
    const out={};
    const s=await g('/api/v1/search?q=qa&company_id=${CO}&workspace_id=${WS}&limit=50');
    const j=s.j||{};
    for(const b of ['messages','files','users','channels']){
      const a=j[b]||[];
      out[b]={n:a.length,
        keys:a[0]?Object.keys(a[0]):[],
        ages:a.slice(0,6).map(x=>({d:(x.created_at||'').slice(0,10), days:age(x.created_at)}))};
    }
    const m=await g('/api/v1/workspaces/${WS}/members?limit=50');
    const mem=(m.j&&(m.j.members||m.j.data||m.j.items))||[];
    out.members={n:mem.length, sample:mem.slice(0,4).map(x=>({
      nm:(x.user&&x.user.name)||x.name,
      created:(x.created_at||(x.user&&x.user.created_at)||'').slice(0,10),
      days:age(x.created_at||(x.user&&x.user.created_at))}))};
    return out; })()`);
};
