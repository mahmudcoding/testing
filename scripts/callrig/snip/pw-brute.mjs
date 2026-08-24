export default async ({page}) => await page.evaluate(async (cfg) => {
  const out=[];
  const {mid, tries} = cfg;
  for (let i=0;i<tries.length;i++){
    const t0=performance.now();
    const r = await fetch(`/api/v1/meeting/${mid}/join`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body: JSON.stringify({password: tries[i]})});
    out.push(`${i+1}. pw="${tries[i]}" -> ${r.status} (${Math.round(performance.now()-t0)}ms) ${(await r.text()).slice(0,110)}`);
  }
  return out;
}, {mid: process.env.QA_MID, tries: JSON.parse(process.env.QA_TRIES)});
