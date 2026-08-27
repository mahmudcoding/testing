export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const IDS=['M4OX1WV9JGJABMQ','M4OX1YCHLY0H2DI','M4OX21O3JKNHKTE'];
  await page.goto('https://airion-cargo.store/w/'+ws+'/c/'+gen);
  await page.waitForTimeout(9000);
  return page.evaluate(async({ws,gen,IDS})=>{
    const out={};
    // A: the two endpoint families, newest page of each
    const a=await fetch(`/api/v1/messaging/channels/${gen}/messages?limit=10`,{credentials:'include'});
    const aj=await a.json().catch(()=>({}));
    out.messagingNewest={status:a.status,
      bodies:(aj.messages||[]).map(m=>({b:(m.body||'').slice(0,26), seq:m.channel_seq}))};
    const b=await fetch(`/api/v1/workspaces/${ws}/channels/${gen}/messages?limit=10`,{credentials:'include'});
    const bt=await b.text();
    let bj={}; try{bj=JSON.parse(bt);}catch(e){}
    out.workspaceNewest={status:b.status,
      bodies:(bj.messages||[]).map(m=>({b:(m.body||'').slice(0,26), seq:m.channel_seq})),
      raw: b.ok? undefined : bt.slice(0,120)};
    // B: fetch each stuck message by id
    out.byId=[];
    for(const id of IDS){
      const r=await fetch(`/api/v1/messaging/messages/${id}`,{credentials:'include'});
      const t=await r.text();
      let j={}; try{j=JSON.parse(t);}catch(e){}
      out.byId.push({id, status:r.status,
        body:(j.body||'').slice(0,26), seq:j.channel_seq, ch:j.channel_id,
        created:j.created_at, err: r.ok? undefined : t.slice(0,110)});
    }
    return out;
  },{ws,gen,IDS});
};
