export default async ({ page }) => {
  const TOK='wWS6o2n4-h-y34y9KQ5CS-jM7XvQA80Ekl_TSTk8OB4=';
  return await page.evaluate(async (t) => {
    const j=async(u,m,b)=>{const r=await fetch(u,{method:m||'GET',credentials:'include',
      headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      return {s:r.status,t:(await r.text()).slice(0,240)};};
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { who: me.email,
      preview: await j(`/api/v1/workspace-invites/${encodeURIComponent(t)}`),
      accept:  await j('/api/v1/workspace-invites/accept','POST',{token:t}) };
  }, TOK);
};
