export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  return page.evaluate(async(ch)=>{
    const ids=[];
    for(let i=1;i<=25;i++){
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:`QA-S2-UNREAD-${String(i).padStart(2,'0')}`,
          idempotency_key:'qau-'+i+'-'+Math.random().toString(36).slice(2)})});
      if(r.ok){const j=await r.json(); ids.push(j.channel_seq);}
    }
    return {posted:ids.length, firstSeq:ids[0], lastSeq:ids[ids.length-1]};
  }, ch);
};
