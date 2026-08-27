const GEN='C4QCGENERAL0001';
export default async ({page}) => {
  return await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
    const j=await r.json(); const l=j.notifications||[];
    const pick=(re)=>l.find(n=>re.test(JSON.stringify(n)));
    const atall=pick(/NOTIF-ALL|NOTIF\\-ALL/);
    const ctrl=pick(/NOTIF-CONTROL|NOTIF\\-CONTROL/);
    const m=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const mj=await m.json();
    return {
      atallNotification: atall? JSON.stringify(atall).slice(0,420):null,
      controlNotification: ctrl? JSON.stringify(ctrl).slice(0,420):null,
      messages:(mj.messages||[]).slice(0,3).map(x=>({body:(x.body||'').slice(0,30),
        mention_ids: x.mention_ids===undefined?'(absent)':JSON.stringify(x.mention_ids)}))};
  }, GEN);
};
