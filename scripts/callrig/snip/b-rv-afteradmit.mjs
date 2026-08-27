export default async ({page}) => {
  const mid=process.env.QA_MID;
  const out={};
  out.host = await page.evaluate(async(id)=>{
    const r=await fetch(`/api/v1/meeting/${id}/waiting`,{credentials:'include'}); let b=null; try{b=await r.json();}catch{}
    const p=await (await fetch(`/api/v1/meeting/${id}/participants`,{credentials:'include'})).json().catch(()=>null);
    const arr=(p&&(p.participants||p.items||p.data))||[];
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {waitingStatus:r.status, waiting:JSON.stringify(b).slice(0,200), inCallText:(t.match(/\d+ in call/i)||[])[0]||null,
      rows:arr.filter(x=>!x.left_at).map(x=>x.name)};
  }, mid);
  return out;
};
