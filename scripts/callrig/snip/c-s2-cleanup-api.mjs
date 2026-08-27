// API-only: does NOT navigate, safe for the parked idle tab
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const keep=(process.env.QA_KEEP||'').split(',').filter(Boolean);
  return page.evaluate(async({ws,keep})=>{
    const FIXTURE=new Set(['qa-general','qa-private','qa-empty','qa-archived']);
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=Array.isArray(j)?j:(j.channels||j.items||[]);
    const out=[];
    for(const c of arr){
      const name=c.name||''; const id=c.id||c.channel_id;
      if(FIXTURE.has(name)){ out.push({name, action:'skip: fixture'}); continue; }
      if(keep.includes(name)){ out.push({name, action:'skip: keep'}); continue; }
      if(name==='qa-c-spaces-test'){ out.push({name, action:'skip: not mine'}); continue; }
      const a=await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
      const t=await a.text();
      out.push({name, action:'archive', status:a.status,
        note:a.ok?'':(t.match(/"key":"([^"]+)"/)||['',''])[1]});
    }
    return out;},{ws,keep});
};
