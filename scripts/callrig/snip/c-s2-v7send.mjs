export default async ({page}) => {
  const ch='C4QCGENERAL0001';
  return page.evaluate(async(ch)=>{
    const mk=async(body,extra)=>{
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body, idempotency_key:'qa-'+Math.random().toString(36).slice(2), ...extra})});
      const j=await r.json(); return {status:r.status, id:j.id, mention_ids:j.mention_ids};
    };
    const ctl=await mk('@qa_c_bob QA-S2-V7-CONTROL', {mention_user_ids:['U4QCBOB00000001']});
    const all=await mk('@all QA-S2-V7-ALL', {mention_all:true});
    const here=await mk('@here QA-S2-V7-HERE', {mention_here:true});
    // read them back
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'})).json();
    const ms=(j.messages||j.data||j||[]).filter(m=>/V7-/.test(m.body||''))
      .map(m=>({body:m.body.slice(0,30), mention_ids:m.mention_ids ?? null}));
    return {ctl, all, here, readback:ms};
  }, ch);
};
