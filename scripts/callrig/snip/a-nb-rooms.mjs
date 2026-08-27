export default async ({page}) => await page.evaluate(async ()=>{
  const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const r=await fetch(`/api/v1/meeting/${id}/breakout-rooms`,{credentials:'include'});
  const j=await r.json(); const arr=j.rooms||j.breakout_rooms||j.data||j;
  return {status:r.status, rooms:(Array.isArray(arr)?arr:[]).map(x=>({name:x.name,status:x.status,
    n:x.participant_count!==undefined?x.participant_count:(x.participants||[]).length, id:x.id}))};
});
