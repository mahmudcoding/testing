const WS='W4QCF1XTURESO01', DM='C4OVEWOTJW1AA86';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(1000);
  await page.goto(`https://airion-cargo.store/w/${WS}/d/${DM}`,{waitUntil:'load'});
  await page.waitForTimeout(9000);
  return await page.evaluate(async (dm)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=30`,{credentials:'include'});
    const j=await r.json(); const list=(j.messages||j.data||[]);
    const cur=await fetch('/api/v1/meetings/current',{credentials:'include'});
    return {url:location.href, apiTotal:list.length,
      apiSummary:list.map(m=>({id:m.id.slice(-6), body:(m.body||'').slice(0,24), outcome:m.call_outcome, dur:m.call_duration_seconds, at:m.created_at})),
      current:{s:cur.status, b:(await cur.text()).slice(0,160)},
      domRows: [...document.querySelectorAll('[data-message-id]')].map(e=>({id:e.getAttribute('data-message-id').slice(-6),
        text:e.innerText.replace(/\n+/g,' | ').slice(0,70)})),
      mainText:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,220)};
  }, DM);
};
