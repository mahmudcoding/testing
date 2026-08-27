import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push(r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,130)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  // API-level: how many results does a broad query have, and does it offer more?
  out.counts = await page.evaluate(`(async () => {
    const q=['a','e','probe','qa','test','the'];
    const res={};
    for(const term of q){
      const r=await fetch('/api/v1/search?q='+term+'&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=25',{credentials:'include'});
      const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){}
      if(!d){ res[term]='parse-fail '+r.status; continue; }
      const keys=Object.keys(d).join(',');
      const msgs=(d.messages||d.results?.messages||[]);
      res[term]={st:r.status, topKeys:keys.slice(0,90), messages:Array.isArray(msgs)?msgs.length:'n/a',
                 total:d.total??d.total_count??'(none)', cursor:d.next_cursor??d.cursor??'(none)'};
    }
    return res; })()`);
  return out;
};
