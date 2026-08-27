export default async ({page}) => await page.evaluate(async ()=>{
  const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const r=await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'});
  const j=await r.json(); const arr=j.participants||j.data||[];
  const rows=(Array.isArray(arr)?arr:[]).map(p=>({
    who:(p.name||p.display_name||p.user_id||'?').toString().slice(0,16),
    type:p.type, status:p.status, joined:!!p.has_joined, left:(p.left_at||'')? 'left':'',
    room:(p.breakout_room_id||'')?'room':''}));
  return {s:r.status, n:rows.length, rows:rows.slice(0,12)};
});
