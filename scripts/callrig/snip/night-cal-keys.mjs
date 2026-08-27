export default async ({page}) => page.evaluate(async (id)=>{
  const url='/api/v1/calendar/meetings?workspace_id=W4QAF1XTURESO01'
    +'&from=2026-08-24T19:00:00.000Z&to=2026-08-26T19:00:00.000Z';
  const r=await fetch(url,{credentials:'include'});
  const j=await r.json();
  const arr=j.meetings||j.items||j.data||[];
  const m=(Array.isArray(arr)?arr:[]).find(x=>x.id===id);
  if(!m) return {found:false, topKeys:Object.keys(j)};
  const out={};
  for(const k of Object.keys(m)){ const v=m[k];
    if(v && (Array.isArray(v)||typeof v==='object')) out[k]=JSON.stringify(v).slice(0,150); }
  return {allKeys:Object.keys(m), objectFields:out};
}, 'S4OUG4H2MUT75BQ');
