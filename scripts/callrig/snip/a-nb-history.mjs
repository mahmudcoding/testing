export default async ({page}) => await page.evaluate(async ()=>{
  const r=await fetch('/api/v1/meetings/history?limit=3',{credentials:'include'});
  const j=await r.json(); const arr=j.meetings||j.data||j.items||[];
  return {s:r.status, rows:(Array.isArray(arr)?arr:[]).slice(0,3).map(m=>({name:(m.name||'').slice(0,20),
    status:m.status, ended:(m.ended_at||'').slice(0,19), dur:m.duration_seconds}))};
});
