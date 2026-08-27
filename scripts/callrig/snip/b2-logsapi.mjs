export default async ({page}) => {
  const M = process.env.QA_MEETING;
  return await page.evaluate(async(m)=>{
    const tries=[`/api/v1/meeting/${m}/logs?limit=100`,`/api/v1/meetings/${m}/logs?limit=100`,
      `/api/v1/meeting/${m}/audit?limit=100`,`/api/v1/meeting/${m}/audit-events?limit=100`,
      `/api/v1/meeting/${m}/activity?limit=100`,`/api/v1/meeting/${m}/events?limit=100`];
    const out=[];
    for(const u of tries){
      try{const r=await fetch(u,{credentials:'include'});
        const txt=await r.text();
        out.push({u, status:r.status, len:txt.length, sample:txt.slice(0,1600)});
        if(r.ok) break;
      }catch(e){out.push({u,err:String(e).slice(0,60)});}
    }
    return out;
  }, M);
};
