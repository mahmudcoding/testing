export default async ({page}) => {
  const cur = await page.evaluate(async()=>{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json();return j&&j.meeting?j.meeting.id:null;});
  if (!cur) return {none:true};
  const res = await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}/end`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});return r.status+' '+(await r.text()).slice(0,120);}, cur);
  return {ended: cur, res};
};
