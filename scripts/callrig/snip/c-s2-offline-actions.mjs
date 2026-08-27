export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const api=(fn,arg)=>page.evaluate(fn,arg);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // three fresh target messages, posted online via API (raw bodies, easy to read back)
  out.targets=await api(async(ch)=>{
    const r=[];
    for(const t of ['QA-S2-OA-edit','QA-S2-OA-react','QA-S2-OA-del']){
      const p=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({channel_id:ch, body:t, idempotency_key:'qaoa-'+Math.random().toString(36).slice(2)})});
      const j=await p.json(); r.push({t, id:j.id, seq:j.channel_seq});
    }
    return r;}, ch);
  await page.reload(); await page.waitForTimeout(9000);
  const [E,R,D]=out.targets;
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  // perform all three offline, via the UI where possible, else the API the UI calls
  out.offlineCalls=await api(async({ch,E,R,D})=>{
    const res={};
    const j=async(p)=>{try{const r=await p; return {status:r.status};}catch(e){return {err:String(e).slice(0,40)};}};
    res.edit=await j(fetch(`/api/v1/messaging/messages/${E.id}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({body:'QA-S2-OA-edit-DONE'})}));
    res.react=await j(fetch(`/api/v1/messaging/messages/${R.id}/reactions`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({emoji:'🚀'})}));
    res.del=await j(fetch(`/api/v1/messaging/messages/${D.id}`,{method:'DELETE',credentials:'include'}));
    return res;},{ch,E,R,D});
  await ctx.setOffline(false); await page.waitForTimeout(15000);
  await page.reload(); await page.waitForTimeout(10000);
  out.serverAfter=await api(async({ch,E,R,D})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||[];
    const pick=(id)=>{const m=arr.find(x=>x.id===id);
      return m? {body:(m.body||'').slice(0,26), edited:m.edited,
        reactions:(m.reactions||[]).map(x=>x.emoji||x.key||JSON.stringify(x).slice(0,8))} : 'absent';};
    return {edit:pick(E.id), react:pick(R.id), del:pick(D.id),
      newestBodies:arr.slice(0,4).map(m=>(m.body||'').slice(0,26))};},{ch,E,R,D});
  return out;
};
