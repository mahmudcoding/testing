export default async ({ctx}) => {
  const pages = ctx.pages().filter(p=>p.url().includes('airion-cargo.store'));
  const out={pages:pages.map(p=>p.url())};
  const g = pages.find(p=>/\/guest\/meeting\//.test(p.url()));
  if(!g) return out;
  out.guest = await g.evaluate(async()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const mid=(location.pathname.match(/meeting\/([A-Za-z0-9]+)/)||[])[1];
    let rooms=null; try{ const r=await fetch(`/api/v1/meeting/${mid}/breakout-rooms`,{credentials:'include'}); rooms={s:r.status, b:JSON.stringify(await r.json()).slice(0,400)}; }catch(e){rooms='ERR '+e.message;}
    return {mid, rooms, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,400),
      panel: document.querySelector('[data-testid="call-controls-breakout-rooms"]')?.getAttribute('aria-pressed'),
      actions:[...document.querySelectorAll('[data-testid="side-room-action"]')].map(b=>({t:(b.innerText||'').trim(), vis:vis(b)}))};
  });
  return out;
};
