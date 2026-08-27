export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const out=[]; const t0=Date.now();
    for (let i=0;i<8;i++){
      const r=await fetch('/api/v1/notifications?limit=40',{credentials:'include'});
      const j=await r.json(); const l=j.notifications||[];
      const blob=JSON.stringify(l);
      out.push({ms:Date.now()-t0, total:j.total,
        allHit:/NOTIF-ALL|NOTIF\\-ALL/.test(blob), hereHit:/NOTIF-HERE|NOTIF\\-HERE/.test(blob),
        controlHit:/NOTIF-CONTROL|NOTIF\\-CONTROL/.test(blob),
        newest:{type:l[0]&&l[0].type, title:(l[0]&&l[0].title||'').slice(0,26), body:(l[0]&&(l[0].body||l[0].message)||'').slice(0,50)}});
      if (out[out.length-1].allHit && out[out.length-1].hereHit) break;
      await new Promise(res=>setTimeout(res,3000));
    }
    const r=await fetch('/api/v1/notifications?limit=40',{credentials:'include'});
    const j=await r.json();
    return {samples:out.length, first:out[0], last:out[out.length-1],
      titles:(j.notifications||[]).slice(0,6).map(n=>({t:n.type, ti:(n.title||'').slice(0,26), b:(n.body||n.message||'').slice(0,44)}))};
  });
};
