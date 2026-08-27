export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/channels/members/remove',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:'C4OXIAPDMVKNB3E', user_id:'U4QCALICE000001'})});
  let j=null; try{j=await r.json()}catch{}
  return {status:r.status, key:j&&j.key};
});
