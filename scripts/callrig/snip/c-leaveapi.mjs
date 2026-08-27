export default async ({page}) => {
  const id=process.env.QA_CALL;
  return await page.evaluate(async (id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/leave`,{method:'POST',credentials:'include'});
    const t=(await r.text()).slice(0,120);
    let cur=null; try{cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    return {s:r.status,t, current: cur&&cur.meeting?cur.meeting.id:null};
  }, id);
};
