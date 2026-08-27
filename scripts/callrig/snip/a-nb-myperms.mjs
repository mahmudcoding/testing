export default async ({page}) => await page.evaluate(async ()=>{
  const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const r=await fetch(`/api/v1/meeting/${id}/my-permissions`,{credentials:'include'});
  const j=await r.json(); const d=j.permissions||j.data||j;
  return {status:r.status, role:d.role||j.role||null,
    on:Object.keys(d).filter(k=>d[k]===true)};
});
