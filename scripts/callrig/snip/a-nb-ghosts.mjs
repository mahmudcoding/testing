export default async ({page}) => await page.evaluate(async ()=>{
  const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const r=await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'});
  const j=await r.json(); const arr=j.participants||j.data||[];
  const rows=(Array.isArray(arr)?arr:[]);
  return {n:rows.length,
    users:rows.filter(p=>p.type==='user').map(p=>p.name),
    guests:rows.filter(p=>p.type==='guest').map(p=>({name:p.name, joined:(p.joined_at||'').slice(11,19)}))};
});
