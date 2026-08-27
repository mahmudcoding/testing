export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json();
    const el=[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-SLOWNET/.test(m.innerText||'')).pop();
    return {api:(j.messages||[]).map(m=>(m.body||'').slice(0,24)),
      domCount:[...document.querySelectorAll('[data-message-id]')].filter(m=>/QA-S2-SLOWNET/.test(m.innerText||'')).length,
      ctrls: el? [...el.querySelectorAll('button,[role="img"]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.getAttribute('title')||'').trim()).filter(Boolean):null,
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  });
};
