export default async ({page}) => await page.evaluate(async ()=>{
  const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const r=await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'});
  const t=await r.text();
  return {s:r.status, len:t.length, sample:t.slice(0,900)};
});
