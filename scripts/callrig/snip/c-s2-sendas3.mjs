export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=4',{credentials:'include'});
    const j=await r.json();
    const api=(j.messages||[]).map(m=>({id:m.id.slice(-6), body:(m.body||'').slice(0,20), type:m.type||'(none)',
      files:(m.files||[]).map(f=>f.filename+'/'+f.id.slice(-6)), at:m.created_at}));
    const rows=[...document.querySelectorAll('[data-message-id]')].slice(-3).map(e=>({
      id:e.getAttribute('data-message-id').slice(-6),
      imgs:e.querySelectorAll('img').length,
      text:e.innerText.replace(/\n+/g,' | ').slice(0,70),
      buttons:[...e.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)}));
    return {api, rows};
  });
};
