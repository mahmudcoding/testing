export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()==='POST'){let b='';try{b=(await r.text()).slice(0,220);}catch(e){} net.push(`${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const before = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=5',{credentials:'include'})).json();
    return (j.messages||[]).map(m=>({id:m.id, body:(m.body||'').slice(0,60), type:m.type||m.message_type, sys:m.is_system}));
  });
  const m = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meeting',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name:'QA Channel Call', channel_id:'C4QAGENERAL0001', is_private:false})});
    const t = await r.text(); let id=null; try{id=JSON.parse(t).meeting.id;}catch(e){}
    return {status:r.status, id, t:t.slice(0,200)};
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/messaging/channels/C4QAGENERAL0001/messages?limit=5',{credentials:'include'})).json();
    return (j.messages||[]).map(x=>({id:x.id, body:(x.body||'').slice(0,80), type:x.type||x.message_type, sys:x.is_system, meta: JSON.stringify(x.metadata||x.meta||{}).slice(0,120)}));
  });
  return {before, created: m, after, net};
};
