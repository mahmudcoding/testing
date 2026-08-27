import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', async r => { const u=r.url();
    if(/calendar|meeting/i.test(u)&&u.includes('/api/v1/')){ let b=''; try{b=(await r.text());}catch(e){}
      reqs.push({url:decodeURIComponent(u.split('/api/v1/')[1]).slice(0,110), st:r.status, len:b.length, body:b.slice(0,200)}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.calls = reqs.slice(0,4).map(r=>r.st+' '+r.url+' ('+r.len+'B)');
  // find the listing call and summarise what it returned
  const listing = reqs.find(r=>/meetings/i.test(r.url) && r.len>200);
  out.sample = listing? listing.body : '(none)';
  out.parsed = await page.evaluate(`(async () => {
    const tries=['/api/v1/calendar/meetings?from=2026-08-01T00:00:00Z&to=2026-09-30T00:00:00Z',
                 '/api/v1/calendar/meetings'];
    for(const u of tries){
      const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      if(r.status!==200) continue;
      let d=null; try{d=JSON.parse(t);}catch(e){continue;}
      const arr=d.meetings||d.data||d.items||[];
      return {url:u.split('?')[0], st:r.status, n:arr.length,
              rows:arr.slice(0,10).map(m=>({title:(m.title||'').slice(0,34), priv:m.is_private,
                    by:m.created_by?m.created_by.slice(-6):null}))};
    }
    return 'no listing endpoint matched'; })()`);
  return out;
};
