export default async ({page}) => {
  const mid=process.env.QA_MID;
  return await page.evaluate(async(id)=>{
    const p=await (await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'})).json().catch(()=>null);
    const arr=(p&&(p.participants||p.items||p.data))||[];
    const out={rows:arr.map(x=>({name:x.name,type:x.type||x.participant_type,left:x.left_at||null})), tries:[]};
    for (const n of [1,2]) {
      const r=await fetch(`/api/v1/meeting/${id}`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({max_participants:n})});
      let b=null; try{b=await r.json();}catch{}
      out.tries.push({max_participants:n, status:r.status, body:JSON.stringify(b).slice(0,300)});
    }
    const m=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).json().catch(()=>null);
    out.finalMax=(m&&(m.meeting||m)||{}).max_participants;
    return out;
  }, mid);
};
