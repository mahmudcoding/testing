export default async ({page}) => await page.evaluate(async ()=>{
  const ch = 'C4QAGENERAL0001';
  const out={};
  for (const u of [`/api/v1/channels/${ch}/members`, `/api/v1/channels/${ch}`]) {
    try { const r=await fetch(u,{credentials:'include'}); const t=await r.text();
      out[u]={s:r.status, b:t.slice(0,300)}; } catch(e){ out[u]='ERR'; }
  }
  return out;
});
