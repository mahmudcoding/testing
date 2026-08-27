export default async ({page}) => {
  const ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  return await page.evaluate(async ({ch,mid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
    const t=(await r.text()).slice(0,140);
    const g=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j=await g.json().catch(()=>null);
    const arr=Array.isArray(j)?j:(j?.messages||j?.data||[]);
    return {pinStatus:r.status, pinBody:t, pinnedCount:arr.length,
            pinnedIds:arr.map(m=>m.id||m.message_id).slice(0,4)};
  }, {ch,mid});
};
