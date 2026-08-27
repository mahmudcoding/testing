export default async ({page}) => page.evaluate(async ()=>{
  const dave='U4QCDAVE0000001';
  const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({user_id:dave})});
  await new Promise(x=>setTimeout(x,1500));
  const l=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
  let j=null; try{j=await l.json()}catch{}
  const a=(j&&(j.users||j.blocked||j.items))||[];
  return {unblockStatus:r.status, blockedListStatus:l.status,
    stillBlocked:(Array.isArray(a)?a:[]).some(u=>(u.user_id||u.id)===dave),
    blockedCount:Array.isArray(a)?a.length:null};
});
