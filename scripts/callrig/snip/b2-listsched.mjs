export default async ({page}) => await page.evaluate(async()=>{
  const out={};
  for(const [k,u] of [['upcoming','/api/v1/calendar/meetings?limit=50'],
                      ['events','/api/v1/calendar/events?limit=50']]){
    try{ const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      let j=null; try{j=JSON.parse(t);}catch(e){}
      const arr=(j && (j.meetings||j.events||j.items||(Array.isArray(j)?j:null)))||null;
      out[k]={s:r.status, n:Array.isArray(arr)?arr.length:null,
              titles: Array.isArray(arr)?arr.filter(x=>/recurring/i.test(x.title||x.name||'')).map(x=>({t:x.title||x.name, s:x.starts_at, id:x.id})).slice(0,6):null,
              len:t.length};
    }catch(e){ out[k]={err:String(e).slice(0,60)}; }
  }
  return out;
});
