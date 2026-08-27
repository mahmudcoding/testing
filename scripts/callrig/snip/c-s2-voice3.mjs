const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  const out = {};
  out.api = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    const j=await r.json(); return (j.messages||j.data||[]).map(m=>({id:m.id, body:m.body,
      attachments:(m.attachments||m.files||[]).map(a=>({name:a.name||a.file_name, mime:a.mime_type||a.content_type, size:a.size, dur:a.duration||a.duration_ms, id:a.id||a.file_id})), keys:Object.keys(m).join(',').slice(0,220)}));
  }, CH);
  out.dom = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    if(!el) return null;
    return {id: el.getAttribute('data-message-id'), text: el.innerText.replace(/\n+/g,' | ').slice(0,140),
      buttons: [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)),
      audios: [...el.querySelectorAll('audio')].map(a=>({src:(a.currentSrc||a.src||'').slice(0,70), dur:a.duration, paused:a.paused})),
      hasCanvas: el.querySelectorAll('canvas').length, hasSvg: el.querySelectorAll('svg').length};
  });
  return out;
};
