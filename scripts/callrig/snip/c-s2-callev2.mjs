const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async (dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const list=(j.messages||j.data||[]);
    return {events: list.filter(m=>m.call_outcome!==undefined).map(m=>({id:m.id, outcome:m.call_outcome,
        dur:m.call_duration_seconds, by:m.user_id, at:m.created_at})),
      rows: [...document.querySelectorAll('[data-message-id]')].map(e=>({id:e.getAttribute('data-message-id'),
        text:e.innerText.replace(/\n+/g,' | ').slice(0,90),
        buttons:[...e.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).filter(Boolean)}))};
  }, DM);
};
