export default async ({page}) => await page.evaluate(async (mid) => {
  const t0 = performance.now();
  const codes = {};
  const times = [];
  for (let i=0;i<40;i++){
    const s = performance.now();
    const r = await fetch(`/api/v1/meeting/${mid}/join`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body: JSON.stringify({password: 'brute-'+i})});
    times.push(Math.round(performance.now()-s));
    codes[r.status] = (codes[r.status]||0)+1;
  }
  return {attempts:40, totalMs: Math.round(performance.now()-t0), statusCounts: codes,
          firstMs: times.slice(0,5), lastMs: times.slice(-5),
          avgMs: Math.round(times.reduce((a,b)=>a+b,0)/times.length)};
}, process.env.QA_MID);
