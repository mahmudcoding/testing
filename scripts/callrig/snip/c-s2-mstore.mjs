export default async ({page}) => {
  const ch=page.url().split('/c/')[1];
  return await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json();
    const arr=j.messages||j.data||j||[];
    return arr.map(m=>({id:m.id, body:(m.body||'').slice(0,70),
      mention_ids:m.mention_ids, mention_type:m.mention_type,
      keys:Object.keys(m).filter(k=>/ment|notif/i.test(k))}))
      .filter(m=>/MANUAL|PICKED/.test(m.body));
  }, ch);
};
