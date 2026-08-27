export default async ({page}) => await page.evaluate(async(m)=>{
  const tries=[[`/api/v1/meeting/${m}/end`,'POST'],[`/api/v1/meeting/${m}`,'DELETE'],[`/api/v1/meeting/${m}/leave`,'POST']];
  const out=[];
  for(const [u,method] of tries){
    try{ const r=await fetch(u,{method,credentials:'include'}); const t=await r.text();
      out.push({u,method,s:r.status,b:t.slice(0,160)}); if(r.ok) break; }
    catch(e){ out.push({u,err:String(e).slice(0,60)}); }
  }
  const r2=await fetch('/api/v1/meetings/current',{credentials:'include'});
  out.push({current:(await r2.text()).slice(0,160)});
  return out;
}, process.env.QA_MEETING);
