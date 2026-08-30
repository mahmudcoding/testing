export default async ({page}) => {
  const id=process.env.QA_MID;
  return await page.evaluate(async (id)=>{
    const r = await fetch(`/api/v1/meeting/${id}/messages?limit=100`,{credentials:'include'});
    const j = JSON.parse(await r.text());
    const msgs = (j.messages||[]).map(m=>({id:m.id, body:m.body, reply_count:m.reply_count, author:m.author?.name}));
    // fetch thread for each with reply_count>0
    const th={};
    for (const m of msgs.filter(x=>x.reply_count>0)){
      const rr = await fetch(`/api/v1/meeting/${id}/messages/${m.id}/replies?limit=50`,{credentials:'include'});
      th[m.id]={status:rr.status, body:(await rr.text()).slice(0,600)};
    }
    return {msgs, th};
  }, id);
};
