export default async ({page}) => {
  const id=process.env.QA_MID, n=+(process.env.QA_N||120);
  return await page.evaluate(async ({id,n})=>{
    let ok=0, fail=null;
    for(let i=1;i<=n;i++){
      const r=await fetch(`/api/v1/meeting/${id}/messages`,{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'},body:JSON.stringify({body:`DN-BULK-${String(i).padStart(3,'0')}`})});
      if(r.ok) ok++; else { fail={i, s:r.status, b:(await r.text()).slice(0,160)}; break; }
    }
    const g=await fetch(`/api/v1/meeting/${id}/messages?limit=100`,{credentials:'include'});
    const j=JSON.parse(await g.text());
    return {ok, fail, returned:(j.messages||[]).length, first:(j.messages||[])[0]?.body, last:(j.messages||[]).slice(-1)[0]?.body, keys:Object.keys(j)};
  }, {id,n});
};
