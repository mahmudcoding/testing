export default async ({page}) => page.evaluate(()=>{
  clearInterval(window.__lrId);
  const s=window.__lr? window.__lr.s:[];
  const seen=new Set(), out=[];
  for(const x of s) for(const r of x.regions){ const k=r.t; if(!seen.has(k)){seen.add(k); out.push({t:x.t, ...r});} }
  return {samples:s.length, unique:out.slice(0,10)};
});
