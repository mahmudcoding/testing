export default async ({page}) => {
  const mid=process.env.QA_MID;
  const raw = await page.evaluate(async(mid)=>{
    const r=await fetch(`/api/v1/messaging/messages/${mid}/thread?limit=50`,{credentials:'include'});
    const txt=await r.text();
    return {s:r.status, len:txt.length, body:txt.slice(0,600)};
  }, mid);
  const panelDom = await page.evaluate(()=>{
    const eds=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    if(eds.length<2) return {err:'no thread panel', n:eds.length};
    let box=eds[1]; for(let i=0;i<10&&box.parentElement;i++){ box=box.parentElement;
      if(box.getBoundingClientRect().height>400) break; }
    return {text:(box.innerText||'').replace(/\s+/g,' ').slice(0,300),
      msgIds:[...box.querySelectorAll('[data-message-id]')].map(e=>e.getAttribute('data-message-id'))};
  });
  const chRaw = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=30',{credentials:'include'})).json();
    const arr=(j?.data?.messages||j?.messages||[]);
    return arr.map(m=>({id:m.id, b:(m.body||'').slice(0,32), parent:m.parent_id||m.thread_id||m.parent_message_id||null,
                        rc:m.reply_count??m.thread_count??null}));
  });
  return {raw, panelDom, chRaw};
};
