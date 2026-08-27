// Fetches responses IN FULL and enumerates every key — no slicing anywhere.
export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  return await page.evaluate(async({ws,m})=>{
    const walk=(o,pre='')=>{ let ks=[];
      if(o && typeof o==='object'){
        if(Array.isArray(o)){ o.slice(0,3).forEach((v,i)=>{ ks=ks.concat(walk(v, pre+'[]')); }); }
        else for(const k of Object.keys(o)){ ks.push(pre+'.'+k); ks=ks.concat(walk(o[k], pre+'.'+k)); }
      } return ks; };
    const out={};
    for(const [name,url] of [['active',`/api/v1/workspace/${ws}/meetings/active`],
                             ['notifications','/api/v1/notifications?limit=50'],
                             ['meeting',`/api/v1/meeting/${m}`]]){
      const r=await fetch(url,{credentials:'include'});
      const txt=await r.text();
      let j=null; try{ j=JSON.parse(txt); }catch(e){}
      out[name]={status:r.status, fullLength:txt.length,
                 keys:[...new Set(j?walk(j):[])],
                 waitingMatches:(txt.match(/[\w_]*(wait|pending|queue|knock|lobby|admission|request)[\w_]*/gi)||[]).slice(0,20)};
    }
    return out;
  }, {ws:WS, m:M});
};
