export default async ({page}) => {
  const M=process.env.QA_MEETING;
  return await page.evaluate(async(m)=>{
    const out={};
    for(const [k,u] of [['recordings',`/api/v1/meeting/${m}/recordings`],
                        ['participants',`/api/v1/meeting/${m}/participants`],
                        ['meeting',`/api/v1/meeting/${m}`]]){
      try{ const r=await fetch(u,{credentials:'include'}); const t=await r.text();
        out[k]={s:r.status, len:t.length, body:t.slice(0,300)}; }
      catch(e){ out[k]={err:String(e).slice(0,80)}; }
    }
    return out;
  }, M);
};
