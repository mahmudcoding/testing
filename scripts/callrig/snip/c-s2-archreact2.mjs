export default async ({page}) => {
  const ch='C4OWKQTPC7FZ35V', msg='M4OWP8WAUPW7I7U';
  return page.evaluate(async({ch,msg})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${msg}/reactions`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
       body:JSON.stringify({emoji:'🚀'})});
    const body=(await r.text()).slice(0,80);
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===msg);
    return {path:`POST /messaging/channels/<ch>/messages/<id>/reactions {"emoji":"🚀"}`,
      status:r.status, body,
      reactionsNow:(m&&m.reactions)||null, pinnedNow:m&&m.pinned};
  }, {ch,msg});
};
