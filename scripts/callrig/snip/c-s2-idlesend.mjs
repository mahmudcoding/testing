export default async ({page}) => {
  const ch = process.env.QA_CH || 'C4QCGENERAL0001';
  const txt = process.env.QA_MSG || 'QA-S2-IDLE';
  return page.evaluate(async ({ch,txt}) => {
    const r = await fetch('/api/v1/messaging/messages', {method:'POST', credentials:'include',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    const j = await r.json().catch(()=>({}));
    return {status:r.status, id:j.id, ch:j.channel_id, body:txt};
  }, {ch,txt});
};
