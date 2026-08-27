export default async ({page}) => {
  const ch='C4QCPRIVATE0001';
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=60`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const live=a.filter(m=>!m.deleted_at && !m.is_deleted && (m.body||'').length>0);
    const ids=live.map(m=>m.id).slice(0,34);
    const out0={liveCount:live.length};
    const out={liveCount:live.length, tried:0, ok:0, firstError:null, pinnedNow:0};
    for(const id of ids){
      const p=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({pin:true})});
      out.tried++;
      if(p.ok) out.ok++;
      else { const t=await p.text(); if(/NOT_FOUND/.test(t)) { continue; } out.firstError={afterOk:out.ok, status:p.status, body:t.slice(0,160)}; break; }
    }
    const g=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const gj=await g.json().catch(()=>null);
    const arr=Array.isArray(gj)?gj:(gj?.messages||gj?.data||[]);
    out.pinnedNow=arr.length;
    return out;
  }, ch);
};
