export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const out=[]; const t0=Date.now();
    for (let i=0;i<10;i++){
      const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
      const j=await r.json(); const l=j.notifications||[];
      const hit=l.filter(n=>/NOTIF-CONTROL|NOTIF\\-CONTROL/.test(JSON.stringify(n)));
      out.push({ms:Date.now()-t0, total:j.total,
        newest:{type:l[0]&&l[0].type, title:(l[0]&&l[0].title||'').slice(0,30), body:(l[0]&&(l[0].body||l[0].message)||'').slice(0,60)},
        controlHits:hit.length});
      if (hit.length) break;
      await new Promise(res=>setTimeout(res,2500));
    }
    return {samples:out.length, first:out[0], last:out[out.length-1]};
  });
};
