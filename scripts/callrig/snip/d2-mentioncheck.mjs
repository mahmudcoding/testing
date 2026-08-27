export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  out.me = await page.evaluate(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).username);
  out.mentionsPage = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return (m.innerText||'').replace(/\s+/g,' ').slice(0,400);
  });
  out.lastMessages = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QDGENERAL0001/messages?limit=4',{credentials:'include'});
    const j=await r.json();
    const arr=Array.isArray(j)?j:(j.messages||j.data||[]);
    return arr.slice(0,4).map(x=>({body:(x.body||'').slice(0,70), mentions:x.mentions||x.mention_user_ids||null, from:x.user_id||x.sender_id}));
  });
  out.amMember = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/channels',{credentials:'include'});
    const t=await r.text(); return /C4QDGENERAL0001/.test(t);
  });
  return out;
};
