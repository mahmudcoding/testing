export default async ({page}) => {
  const M=process.env.QA_MEETING;
  return await page.evaluate(async(m)=>{
    const out={};
    for (const [k,u] of [['settings',`/api/v1/meeting/${m}/settings`],['meeting',`/api/v1/meeting/${m}`]]) {
      try{ const r=await fetch(u,{credentials:'include'}); const t=await r.text(); out[k]={s:r.status, b:t.slice(0,900)}; }
      catch(e){ out[k]={err:String(e).slice(0,60)}; }
    }
    return out;
  }, M);
};
