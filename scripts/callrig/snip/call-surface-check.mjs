export default async ({page}) => await page.evaluate(async () => {
  const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
  return {
    url: location.href,
    backendCurrent: cur && cur.meeting ? {id:cur.meeting.id, status:cur.meeting.status, name:cur.meeting.name, ch:cur.meeting.channel_id} : null,
    overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    anyCallSurface: [...document.querySelectorAll('[data-testid*="call" i]')].map(e=>e.getAttribute('data-testid')).slice(0,12),
    toolbar: !!document.querySelector('[data-testid="call-toolbar"]'),
    videos: document.querySelectorAll('video').length,
    liveNow: (()=>{const m=document.querySelector('main'); if(!m) return null; const t=m.innerText; const i=t.indexOf('Live now'); return i<0?null:t.slice(i,i+180).replace(/\n+/g,' | ');})()
  };
});
