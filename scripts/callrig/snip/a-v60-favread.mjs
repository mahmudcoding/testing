export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const who=(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null))?.email?.split('@')[0];
    const out={who};
    for (const scope of ['own','shared']) {
      const r=await fetch(`/api/v1/users/me/files?workspace_id=W4QAF1XTURESO01&scope=${scope}`,{credentials:'include'});
      const j=await r.json().catch(()=>null); const a=j?.files||j?.data||(Array.isArray(j)?j:[]);
      out[scope]={status:r.status, n:(a||[]).length,
        rows:(a||[]).map(f=>({id:(f.id||'').slice(-6),name:(f.filename||'').slice(0,18),fav:f.is_favorite,owner:(f.user_id||'').slice(-6)}))};
    }
    return out;
  });
};
