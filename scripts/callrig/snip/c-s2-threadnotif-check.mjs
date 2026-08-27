export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const out=[]; const t0=Date.now();
    for (let i=0;i<7;i++){
      const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
      const j=await r.json(); const l=j.notifications||[]; const blob=JSON.stringify(l);
      out.push({ms:Date.now()-t0, total:j.total, hit:/TNOTIF-REPLY|TNOTIF\\-REPLY/.test(blob),
        newest:{t:l[0]&&l[0].type, ti:(l[0]&&l[0].title||'').slice(0,28), b:(l[0]&&(l[0].body||'')||'').slice(0,40)}});
      if (out[out.length-1].hit) break;
      await new Promise(res=>setTimeout(res,3000));
    }
    return {samples:out.length, first:out[0], last:out[out.length-1]};
  });
};
