import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const out={};
    for(const q of ['normal','seam-a','bob-shared','viewer']){
      const s=await g('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25');
      const j=s.j||{};
      out[q]={topKeys:Object.keys(j).slice(0,8)};
      const buckets=['files','messages','channels','people','results'];
      for(const b of buckets){ if(Array.isArray(j[b])&&j[b].length) out[q][b]=j[b].length; }
      const f=(j.files||[])[0];
      out[q].firstFile = f? {keys:Object.keys(f), raw:JSON.stringify(f).slice(0,320)} : null;
    }
    return out; })()`);
};
