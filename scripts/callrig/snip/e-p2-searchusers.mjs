import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const out={};
    const terms=['Alice','QA Alice','alice','qa_e_alice','Bob','general','qa-general','private'];
    for(const term of terms){
      const r=await fetch('/api/v1/search?q='+encodeURIComponent(term)+'&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=25',{credentials:'include'});
      const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){}
      if(!d){ out[term]='status '+r.status+' '+t.slice(0,80); continue; }
      out[term]={ msgs:(d.messages||[]).length, tm:d.total_messages,
                  users:(d.users||[]).length, tu:d.total_users,
                  chans:(d.channels||[]).length, tc:d.total_channels,
                  files:(d.files||[]).length, tf:d.total_files };
    }
    // and the short-query error
    const r2=await fetch('/api/v1/search?q=a&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=25',{credentials:'include'});
    out.__shortQuery={st:r2.status, body:(await r2.text()).slice(0,220)};
    return out; })()`);
};
