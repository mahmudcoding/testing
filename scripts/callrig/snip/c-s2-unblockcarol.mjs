export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({user_id:'U4QCCAROL000001'})});
  await new Promise(x=>setTimeout(x,1500));
  const l=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
  let j=null; try{j=await l.json()}catch{}
  const a=(j&&(j.users||j.blocked||j.items))||[];
  return {unblock:r.status, blockedCount:Array.isArray(a)?a.length:null};
});
