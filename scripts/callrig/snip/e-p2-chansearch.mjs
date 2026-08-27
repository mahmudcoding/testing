import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const out={};
    const qs=['qa-general','general','qa','qa-priv','private','Alice','QA Alice','alice'];
    for(const q of qs){
      const s=await g('/api/v1/search?q='+encodeURIComponent(q)+'&company_id=${CO}&workspace_id=${WS}&limit=25');
      const j=s.j||{};
      out[q]={st:s.st,
        totals:{m:j.total_messages, f:j.total_files, u:j.total_users, c:j.total_channels},
        got:{m:(j.messages||[]).length, f:(j.files||[]).length, u:(j.users||[]).length, c:(j.channels||[]).length},
        chanNames:(j.channels||[]).map(x=>x.name).slice(0,3),
        userNames:(j.users||[]).map(x=>x.name||x.username).slice(0,3)};
    }
    // with an explicit types filter
    for(const t of ['channel','channels','user','users']){
      const s=await g('/api/v1/search?q=general&types='+t+'&company_id=${CO}&workspace_id=${WS}&limit=25');
      const j=s.j||{};
      out['types='+t]={st:s.st, c:(j.channels||[]).length, u:(j.users||[]).length, tc:j.total_channels, tu:j.total_users};
    }
    return out; })()`);
};
