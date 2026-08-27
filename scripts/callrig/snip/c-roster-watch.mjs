export default async ({page}) => {
  const id=process.env.QA_CALL; const rows=[]; const t0=Date.now(); const dur=+(process.env.QA_DUR||120000);
  while (Date.now()-t0 < dur) {
    const s = await page.evaluate(async (id)=>{
      let p=null,rooms=null,hub=null;
      try{const r=await (await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'})).json();
        p=(r.participants||[]).map(x=>x.name||x.user_id);}catch(e){p='err'}
      try{const r=await (await fetch(`/api/v1/meeting/${id}/rooms`,{credentials:'include'})).json();
        rooms=(r.rooms||[]).map(x=>({n:x.name,c:x.participant_count}));}catch(e){rooms='err'}
      try{const r=await (await fetch(`/api/v1/workspace/W4QCF1XTURESO01/meetings/active`,{credentials:'include'})).json();
        const m=(r.meetings||[]).find(x=>x.id===id); hub=m?(m.participant_count??m.participants_count??null):null;}catch(e){hub='err'}
      return {p, rooms, hub};
    }, id);
    rows.push({s:Math.round((Date.now()-t0)/1000), ...s});
    await page.waitForTimeout(5000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.p,r.rooms,r.hub]); if(k!==prev){cond.push(r);prev=k;}}
  return {changes:cond.slice(0,20), last:rows[rows.length-1]};
};
