export default async ({page}) => page.evaluate(async (id)=>{
  const url='/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01'
    +'&from=2026-08-24T19:00:00.000Z&to=2026-08-26T19:00:00.000Z';
  const r=await fetch(url,{credentials:'include'});
  const j=await r.json();
  const arr=j.meetings||j.items||j.data||[];
  const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===id);
  if(!m) return {status:r.status, found:false, count:Array.isArray(arr)?arr.length:-1,
                 topKeys:Object.keys(j).slice(0,6)};
  const pk=Object.keys(m).filter(k=>/partic|attend|invit|guest/i.test(k));
  return {status:r.status, found:true, keys:Object.keys(m).length,
    participantKeys:pk, sample:pk.map(k=>[k, JSON.stringify(m[k]).slice(0,180)])};
}, 'S4OUG4H2MUT75BQ');
