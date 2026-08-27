export default async ({page}) => await page.evaluate(async ()=>{
  const id = location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
  const out={};
  for (const u of [`/api/v1/meeting/${id}/breakout-rooms`, `/api/v1/meeting/${id}/breakout-rooms/invites`]) {
    try { const r=await fetch(u,{credentials:'include'}); out[u.split('/').pop()]={s:r.status,b:(await r.text()).slice(0,260)}; }
    catch(e){ out[u]='ERR'; }
  }
  return out;
});
