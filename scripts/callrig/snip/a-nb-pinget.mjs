export default async ({page}) => {
  const id = location => null;
  return await page.evaluate(async ()=>{
    const m = location.pathname.match(/\/call\/([A-Z0-9]+)/); const id = m && m[1];
    const out = {id};
    for (const p of [`/api/v1/meeting/${id}/pin`, `/api/v1/meeting/${id}`]) {
      try { const r = await fetch(p,{credentials:'include'}); out[p.split('/').pop()] = {s:r.status, b:(await r.text()).slice(0,400)}; }
      catch(e){ out[p]='ERR'; }
    }
    return out; });
};
