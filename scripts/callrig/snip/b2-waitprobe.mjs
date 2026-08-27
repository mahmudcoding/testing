export default async ({page}) => {
  const M=process.env.QA_MEETING, WS='W4QBF1XTURESO01';
  return await page.evaluate(async({m,ws})=>{
    const out={};
    const urls={
      notifications:'/api/v1/notifications?limit=10',
      active:`/api/v1/workspace/${ws}/meetings/active`,
      meeting:`/api/v1/meeting/${m}`,
      current:'/api/v1/meetings/current'
    };
    for(const [k,u] of Object.entries(urls)){
      try{ const r=await fetch(u,{credentials:'include'}); const t=await r.text();
        out[k]={s:r.status, hasWaitWord:/wait|pending|approval|knock|lobby/i.test(t), len:t.length, b:t.slice(0,520)}; }
      catch(e){ out[k]={err:String(e).slice(0,60)}; }
    }
    return out;
  }, {m:M, ws:WS});
};
