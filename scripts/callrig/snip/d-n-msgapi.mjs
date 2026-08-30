export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async (id)=>{
    const r = await fetch(`/api/v1/meeting/${id}/messages?limit=100`,{credentials:'include'});
    const t = await r.text();
    let j=null; try{j=JSON.parse(t);}catch(e){}
    const arr = j? (j.messages||j.data||j.items||[]) : [];
    return {status:r.status, n:arr.length, keys: arr[0]?Object.keys(arr[0]):null,
      bodies: arr.map(m=>({b:(m.body||m.content||m.text||'').slice(0,60), to:m.recipient_id||m.private_to||m.target_user_id||null, priv:m.is_private??null})),
      raw: t.length>4000? t.slice(0,4000)+'…[TRUNC '+t.length+']' : t};
  }, id);
};
