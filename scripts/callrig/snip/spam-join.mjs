export default async ({page}) => await page.evaluate(async (mid) => {
  const out=[];
  for (let i=0;i<8;i++){
    const t0=performance.now();
    const r = await fetch(`/api/v1/meeting/${mid}/join`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
    const b = (await r.text()).slice(0,120);
    out.push(`#${i+1} ${r.status} (${Math.round(performance.now()-t0)}ms) ${b}`);
  }
  return out;
}, process.env.QA_MID);
