export default async ({page}) => {
  const mid=process.env.QA_MID;
  const samples=[];
  for (let i=0;i<Number(process.env.QA_N||5);i++){
    const s = await page.evaluate(async(id)=>{
      const r=await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'});
      const j=await r.json().catch(()=>null); const a=(j&&(j.participants||j.items||j.data))||[];
      const m=await (await fetch(`/api/v1/workspace/W4QBF1XTURESO01/meetings/active`,{credentials:'include'})).json().catch(()=>null);
      const mm=(m&&m.meetings||[]).find(x=>x.id===id);
      return {t:new Date().toISOString(),
        rows:a.map(p=>({name:p.name,type:p.type||p.participant_type,left:p.left_at||null,br:p.in_breakout})),
        active:a.filter(p=>!p.left_at).length, pc:mm&&mm.participant_count};
    }, mid);
    samples.push(s);
    if (i < Number(process.env.QA_N||5)-1) await page.waitForTimeout(Number(process.env.QA_EVERY||20000));
  }
  return {samples};
};
