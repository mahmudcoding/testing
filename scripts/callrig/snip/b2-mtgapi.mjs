export default async ({page}) => {
  const M=process.env.QA_MEETING;
  return await page.evaluate(async (m) => {
    const out={};
    for (const [k,u] of [['meeting',`/api/v1/meeting/${m}`],['current','/api/v1/meetings/current'],['active','/api/v1/workspace/W4QBF1XTURESO01/meetings/active']]) {
      try { const r=await fetch(u,{credentials:'include'}); const t=await r.text(); out[k]={s:r.status, b:t.slice(0,700)}; } catch(e){ out[k]={err:String(e).slice(0,80)}; }
    }
    return out;
  }, M);
};
